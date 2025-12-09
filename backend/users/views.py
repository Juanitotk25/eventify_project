# backend/users/views.py

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from event_management.models import EventRegistration, Event
from event_management.serializers import EventSerializer
from .serializers import UserSerializer


class RegisterView(generics.CreateAPIView):
    # Permite que cualquiera (no autenticado) pueda registrarse
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"message": "Registro exitoso. Ahora puedes iniciar sesión."},
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class UserNotificationsView(APIView):
    """
    View para obtener los eventos en los que el usuario está inscrito.
    Se usará para el icono de notificaciones.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Obtener las inscripciones del usuario con información del evento
            registrations = EventRegistration.objects.filter(
                user=request.user.profile
            ).select_related('event').order_by('-created_at')
            
            # Preparar los datos de los eventos
            events_data = []
            for registration in registrations[:10]:  # Limitar a los últimos 10
                event = registration.event
                events_data.append({
                    'id': event.id,
                    'title': event.title,
                    'description': event.description[:100] + '...' if event.description and len(event.description) > 100 else event.description,
                    'start_time': event.start_time,
                    'location': event.location,
                    'category': event.category.name if event.category else None,
                    'cover_url': event.cover_url,
                    'registration_id': str(registration.id),  # ¡IMPORTANTE para cancelar!
                    'registration_date': registration.created_at,
                    'status': registration.status,
                })
            
            return Response({
                'event_count': registrations.count(),
                'events': events_data,
                'user_id': request.user.id,
                'username': request.user.username
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'event_count': 0,
                'events': [],
                'error': str(e)
            }, status=status.HTTP_200_OK)


class CancelRegistrationView(APIView):
    """
    View para cancelar la inscripción a un evento.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, registration_id):
        try:
            # Buscar la inscripción
            registration = get_object_or_404(
                EventRegistration,
                id=registration_id,
                user=request.user.profile  # Solo puede cancelar sus propias inscripciones
            )
            
            # Guardar información para la respuesta
            event_title = registration.event.title
            registration_id_str = str(registration.id)
            
            # Eliminar la inscripción
            registration.delete()
            
            return Response({
                'success': True,
                'message': f'Inscripción a "{event_title}" cancelada exitosamente.',
                'registration_id': registration_id_str,
                'event_title': event_title,
            }, status=status.HTTP_200_OK)
            
        except EventRegistration.DoesNotExist:
            return Response({
                'success': False,
                'error': 'No se encontró la inscripción.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
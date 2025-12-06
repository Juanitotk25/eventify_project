# backend/users/views.py

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from event_management.models import EventRegistration
from event_management.serializers import EventSerializer  # Importar el serializer de eventos
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
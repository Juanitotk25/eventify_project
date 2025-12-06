# backend/users/views.py

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from event_management.models import EventRegistration  # Importamos el modelo de eventos
from .serializers import UserSerializer  # Aún no existe, la crearemos


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


class UserEventCountView(APIView):
    """
    View para obtener el número de eventos en los que el usuario está inscrito.
    Se usará para el icono de notificaciones.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Contar las inscripciones del usuario actual
            count = EventRegistration.objects.filter(
                user=request.user.profile
            ).count()
            
            return Response({
                "event_count": count,
                "user_id": request.user.id,
                "username": request.user.username
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "event_count": 0,
                "error": str(e)
            }, status=status.HTTP_200_OK)  # Devuelve 0 en caso de error
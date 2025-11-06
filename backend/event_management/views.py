# En event_management/views.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Event
from .serializers import EventSerializer
# from users.models import Profile # No necesaria si usamos self.request.user.profile

class EventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EventSerializer
    
    # 1. Función para LISTAR eventos (GET)
    def get_queryset(self):
        # USA LA RELACIÓN INVERSA SIMPLE: self.request.user.profile
        try:
            return Event.objects.filter(organizer=self.request.user.profile).order_by('-start_time')
        except:
            # Si el usuario no tiene perfil (o cualquier otro error de enlace), no muestra nada.
            return Event.objects.none()

    # 2. Función para CREAR eventos (POST)
    def perform_create(self, serializer):
        # ASIGNA EL ORGANIZADOR USANDO LA RELACIÓN INVERSA
        serializer.save(organizer=self.request.user.profile)
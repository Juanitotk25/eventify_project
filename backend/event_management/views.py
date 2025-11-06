from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Event
from .serializers import EventSerializer

class EventViewSet(viewsets.ModelViewSet):
    # Solo permite acceso a usuarios autenticados
    permission_classes = [IsAuthenticated]
    serializer_class = EventSerializer
    
    def get_queryset(self):
        if hasattr(self.request.user, 'profile'):
             return Event.objects.filter(organizer=self.request.user.profile).order_by('-start_time')
        return Event.objects.none() # Devuelve vacío si no hay perfil

    def perform_create(self, serializer):
        # Asigna automáticamente el usuario logueado como organizador
        # Asumo que request.user tiene una relación inversa 'profile'
        organizer_profile = self.request.user.profile
        serializer.save(organizer=organizer_profile)
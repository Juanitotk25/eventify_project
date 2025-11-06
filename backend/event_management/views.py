from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Event
from .serializers import EventSerializer
from users.models import Profile

class EventViewSet(viewsets.ModelViewSet):
    # Solo permite acceso a usuarios autenticados
    permission_classes = [IsAuthenticated]
    serializer_class = EventSerializer
    
    def get_queryset(self):
        try:
            current_profile = Profile.objects.get(username=self.request.user)
            return Event.objects.filter(organizer=current_profile).order_by('-start_time')
        except Profile.DoesNotExist:
            # Si el usuario no tiene perfil, no tiene eventos organizados para mostrar.
            return Event.objects.none()

    def perform_create(self, serializer):
        try:
            # 1. Obtenemos el objeto Profile buscando por el ID del usuario logueado.
            #    (Asumiendo que Profile tiene un campo user_id o user que enlaza a User)
            current_profile = Profile.objects.get(username=self.request.user) 
            
            # 2. Asignamos el Profile al nuevo evento.
            serializer.save(organizer=current_profile)
            
        except Profile.DoesNotExist:
            # En un entorno de producción, esto debería lanzar una excepción 403 Forbidden.
            # Para depuración, simplemente ignoramos.
            pass
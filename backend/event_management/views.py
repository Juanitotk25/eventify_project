# En event_management/views.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from .models import Event
from .serializers import EventSerializer
from django.db.models import Q
# from users.models import Profile # No necesaria si usamos self.request.user.profile

class EventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EventSerializer
    queryset = Event.objects.all().order_by('-start_time')
    filter_backends = [SearchFilter]
    search_fields = ['title', 'description', 'location']
    
    # 1. Función para LISTAR eventos (GET)
def get_queryset(self):
    qs = Event.objects.all().order_by('-start_time')
    search = self.request.query_params.get('search')
    if search:
        qs = qs.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(location__icontains=search)
        )
    return qs

    # 2. Función para CREAR eventos (POST)
def perform_create(self, serializer):
    # ASIGNA EL ORGANIZADOR USANDO LA RELACIÓN INVERSA
    serializer.save(organizer=self.request.user.profile)
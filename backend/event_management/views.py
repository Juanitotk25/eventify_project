from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from .serializers import EventSerializer
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .filters import EventFilter
from .models import Event
#from users.models import Profile # No necesaria si usamos self.request.user.profile


class EventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = EventFilter
    search_fields = ['title', 'description', 'location']
    
    # 1. Función para LISTAR eventos (GET)
    def get_queryset(self):
        qs = Event.objects.all().order_by("-start_time")

        mine = self.request.query_params.get("mine")
        user = self.request.user

        if mine and mine.lower() in ['true', '1', 'yes']:
            try:
                qs = qs.filter(organizer=user.profile)
            except:
                return Event.objects.none()

        return qs

            # 2. Función para CREAR eventos (POST)
    def perform_create(self, serializer):
        # ASIGNA EL ORGANIZADOR USANDO LA RELACIÓN INVERSA
        serializer.save(organizer=self.request.user.profile)
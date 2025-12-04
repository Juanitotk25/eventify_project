from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from .serializers import EventSerializer
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .filters import EventFilter
from .models import Event, EventRegistration
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
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

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        event = self.get_object()
        user = request.user.profile

        # Verificar si ya está inscrito
        if EventRegistration.objects.filter(event=event, user=user).exists():
            return Response(
                {"detail": "Ya estás inscrito en este evento."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear inscripción
        EventRegistration.objects.create(event=event, user=user)
        return Response(
            {"detail": "Inscripción exitosa."},
            status=status.HTTP_201_CREATED
        )
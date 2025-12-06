from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.filters import SearchFilter
from .serializers import EventSerializer, CategorySerializer, EventRegistrationSerializer
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .filters import EventFilter
from .models import Event, EventRegistration, Category
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
#from users.models import Profile # No necesaria si usamos self.request.user.profile


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing categories.
    Public access - anyone can view categories.
    """
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # Public access


class EventViewSet(viewsets.ModelViewSet):
    # Allow anyone to view events (GET), but require authentication for create/update/delete
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = EventFilter
    search_fields = ['title', 'description', 'location']
    
    # 1. Función para LISTAR eventos (GET)
    def get_queryset(self):
        # Filter to show only public events for unauthenticated users
        # Authenticated users can see all events (or filter by 'mine' parameter)
        qs = Event.objects.all().order_by("-start_time")

        # If user is not authenticated, only show public events
        if not self.request.user.is_authenticated:
            qs = qs.filter(is_public=True)

        mine = self.request.query_params.get("mine")
        if mine and mine.lower() in ['true', '1', 'yes']:
            if self.request.user.is_authenticated:
                try:
                    qs = qs.filter(organizer=self.request.user.profile)
                except:
                    return Event.objects.none()
            else:
                # Unauthenticated users cannot filter by 'mine'
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
    
    @action(detail=True, methods=['get'])
    def registrations(self, request, pk=None):
        """
        Get all registrations for this event.
        Requires authentication.
        """
        event = self.get_object()
        registrations = event.registrations.all().select_related('user')
        serializer = EventRegistrationSerializer(registrations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def check_registration(self, request, pk=None):
        """
        Check if the current user is registered for this event.
        Requires authentication.
        """
        event = self.get_object()
        if not request.user.is_authenticated:
            return Response({"is_registered": False}, status=status.HTTP_200_OK)
        
        try:
            is_registered = EventRegistration.objects.filter(
                event=event, 
                user=request.user.profile
            ).exists()
            return Response({"is_registered": is_registered}, status=status.HTTP_200_OK)
        except:
            return Response({"is_registered": False}, status=status.HTTP_200_OK)
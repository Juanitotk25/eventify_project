from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.filters import SearchFilter
from .serializers import EventSerializer, CategorySerializer, EventRegistrationSerializer
from django.db.models import Q, Avg
from django_filters.rest_framework import DjangoFilterBackend
from .filters import EventFilter
from .models import Event, RegistrationStatus, EventRegistration, Category
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
        qs = qs.annotate(average_rating=Avg("registrations__rating"))
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
        
    @action(detail=False, methods=['get'])
    def my_event_count(self, request):
        """
        Get the count of events the current user is registered for.
        Requires authentication.
        """
        if not request.user.is_authenticated:
            return Response({"count": 0}, status=status.HTTP_200_OK)
        
        try:
            count = EventRegistration.objects.filter(
                user=request.user.profile
            ).count()
            return Response({"count": count}, status=status.HTTP_200_OK)
        except:
            return Response({"count": 0}, status=status.HTTP_200_OK)
        
    @action(detail=True, methods=['get'])
    def attendance_report(self, request, pk=None):
        """
        Reporte - Solo usernames de las personas
        """
        event = self.get_object()
        
        # Verificar que el usuario es el organizador
        if event.organizer != request.user.profile:
            return Response(
                {"detail": "Solo el organizador puede ver este reporte."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Estadísticas básicas
        total_registered = event.registrations.count()
        total_attended = event.registrations.filter(status=RegistrationStatus.ATTENDED).count()
        
        # Obtener usernames de forma simple
        def get_usernames(queryset):
            usernames = []
            for reg in queryset.select_related('user__user'):
                try:
                    if hasattr(reg.user, 'user') and reg.user.user:
                        usernames.append(reg.user.user.username)
                    else:
                        usernames.append(f"user_{reg.user_id}")
                except:
                    usernames.append("usuario")
            return usernames
        
        # Listas de usernames
        all_usernames = get_usernames(event.registrations.all())
        attendee_usernames = get_usernames(event.registrations.filter(status=RegistrationStatus.ATTENDED))
        pending_usernames = get_usernames(event.registrations.exclude(status=RegistrationStatus.ATTENDED))
        
        return Response({
            "event": {
                "id": str(event.id),
                "title": event.title,
            },
            "statistics": {
                "total_registered": total_registered,
                "total_attended": total_attended,
                "attendance_rate": round((total_attended / total_registered * 100) if total_registered > 0 else 0, 2),
                "pending": total_registered - total_attended
            },
            "usernames": {
                "all": all_usernames,  # Todos los que se unieron
                "attended": attendee_usernames,  # Los que confirmaron asistencia
                "pending": pending_usernames  # Los que no han confirmado
            },
            "counts": {
                "unique_users": len(set(all_usernames)),
                "unique_attended": len(set(attendee_usernames))
            }
        })


class EventRegistrationViewSet(viewsets.ModelViewSet):
    queryset = EventRegistration.objects.all()
    serializer_class = EventRegistrationSerializer
    permission_classes = [IsAuthenticated]

    # Restrict editing to the user who owns the registration
    def get_queryset(self):
        return EventRegistration.objects.filter(user=self.request.user.profile)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=False, methods=["get"])
    def my_events(self, request):
        user_profile = request.user.profile

        # Obtener TODOS los registros del usuario con toda la información
        regs = EventRegistration.objects.filter(user=user_profile) \
            .select_related("event", "event__category", "event__organizer")

        # Crear un diccionario con toda la información de cada registro
        reg_info_map = {}
        for reg in regs:
            reg_info_map[str(reg.event_id)] = {
                "registration_id": str(reg.id),
                "status": reg.status,
                "rating": reg.rating,
                "comment": reg.comment,
                "created_at": reg.created_at,
                "updated_at": reg.updated_at
            }

        # Obtener los eventos y aplicar filtros
        events_qs = Event.objects.filter(id__in=regs.values("event_id")) \
            .select_related("category", "organizer") \
            .annotate(average_rating=Avg("registrations__rating"))
        
        # Aplicar filtros si existen
        filtered_events = EventFilter(request.GET, queryset=events_qs).qs

        # Serializar eventos
        event_data = EventSerializer(filtered_events, many=True).data

        # Inyectar información del registro en cada evento
        for event in event_data:
            reg_info = reg_info_map.get(event["id"], {})
            event["registration_id"] = reg_info.get("registration_id")
            event["registration_status"] = reg_info.get("status", RegistrationStatus.REGISTERED)
            event["rating"] = reg_info.get("rating")
            event["comment"] = reg_info.get("comment")
            event["registration_created_at"] = reg_info.get("created_at")
            event["registration_updated_at"] = reg_info.get("updated_at")

        return Response(event_data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["patch"])
    def rate(self, request, pk=None):
        registration = self.get_object()

        rating = request.data.get("rating")
        comment = request.data.get("comment")

        if rating is None:
            return Response({"detail": "Rating is required."},
                            status=status.HTTP_400_BAD_REQUEST)

        if not (1 <= int(rating) <= 5):
            return Response({"detail": "Rating must be between 1 and 5."},
                            status=status.HTTP_400_BAD_REQUEST)

        registration.rating = rating
        registration.comment = comment
        registration.save()

        return Response(
            {"detail": "Review saved successfully."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=["post"])
    def confirm_attendance(self, request, pk=None):
        """
        Confirmar asistencia a un evento
        """
        registration = self.get_object()
        
        # Verificar que el usuario es quien dice ser
        if registration.user != request.user.profile:
            return Response(
                {"detail": "No tienes permiso para confirmar asistencia en esta inscripción."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Cambiar estado a ATTENDED
        registration.status = RegistrationStatus.ATTENDED
        registration.save()
        
        return Response({
            "success": True,
            "message": "Asistencia confirmada exitosamente",
            "status": registration.status
        }, status=status.HTTP_200_OK)
    
    
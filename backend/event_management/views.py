from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.filters import SearchFilter
from .serializers import EventSerializer, CategorySerializer, EventRegistrationSerializer
from django.db.models import Q, Avg
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

        regs = EventRegistration.objects.filter(user=user_profile) \
            .select_related("event")

        # Apply filters on the *event* but keep registration linked
        events_qs = (Event.objects.filter(id__in=regs.values("event_id"))
            .annotate(average_rating=Avg("registrations__rating")))
        filtered_events = EventFilter(request.GET, queryset=events_qs).qs

        # Build a map: event_id → registration_id
        reg_map = {str(reg.event_id): str(reg.id) for reg in regs}

        # Serialize events
        event_data = EventSerializer(filtered_events, many=True).data

        # Inject registration_id into each event
        for event in event_data:
            event["registration_id"] = reg_map.get(event["id"], None)

        print("\n=== EVENT DATA SENT TO FRONT ===")
        print(event_data)  # <-- prints the injected object
        print("================================\n")

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
# ============================================
# VISTAS PARA REPORTES
# ============================================

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Count, Q, Avg, F
from datetime import datetime, timedelta
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay
import json

# ========== REPORTES PARA ORGANIZADORES ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organizer_event_report(request, event_id):
    """
    Reporte de asistencia para un evento específico (solo organizador del evento o admin)
    """
    try:
        # Verificar si el usuario es admin
        is_admin = request.user.profile.role == "admin"
        
        # Obtener el evento
        event = Event.objects.get(id=event_id)
        
        # Verificar permisos: solo admin o el organizador del evento
        if not is_admin and event.organizer != request.user.profile:
            return Response(
                {
                    'success': False,
                    'error': 'No tienes permisos para ver este reporte. Solo el organizador o administrador pueden acceder.'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener todas las inscripciones para este evento
        registrations = EventRegistration.objects.filter(event=event).select_related('user__user')
        
        # Calcular estadísticas básicas
        total_registered = registrations.count()
        confirmed_count = registrations.filter(status="confirmed").count()
        registered_count = registrations.filter(status="registered").count()
        waitlisted_count = registrations.filter(status="waitlisted").count()
        cancelled_count = registrations.filter(status="cancelled").count()
        attended_count = registrations.filter(attended=True).count()
        
        # Calcular porcentajes
        attendance_rate = (attended_count / confirmed_count * 100) if confirmed_count > 0 else 0
        
        # Lista detallada de inscritos
        registered_users = []
        for reg in registrations:
            user_data = {
                'id': reg.user.user.id,
                'username': reg.user.user.username,
                'email': reg.user.user.email,
                'status': reg.status,
                'attended': reg.attended,
                'attendance_status': reg.get_attendance_status_display(),
                'registration_date': reg.created_at,
                'rating': reg.rating,
                'comment': reg.comment
            }
            registered_users.append(user_data)
        
        # Estadísticas por estado
        status_distribution = {
            'registered': registered_count,
            'confirmed': confirmed_count,
            'waitlisted': waitlisted_count,
            'cancelled': cancelled_count,
            'attended': attended_count
        }
        
        # Promedio de rating si hay calificaciones
        average_rating = registrations.filter(rating__isnull=False).aggregate(
            avg_rating=Avg('rating')
        )['avg_rating'] or 0
        
        return Response({
            'success': True,
            'event': {
                'id': str(event.id),
                'title': event.title,
                'description': event.description,
                'date': event.start_time,
                'end_date': event.end_time,
                'location': event.location,
                'capacity': event.capacity,
                'organizer': event.organizer.user.username,
                'category': event.category.name if event.category else None
            },
            'statistics': {
                'total_registered': total_registered,
                'status_distribution': status_distribution,
                'attended': attended_count,
                'attendance_rate': round(attendance_rate, 2),
                'available_spots': event.capacity - total_registered if event.capacity else 'Ilimitado',
                'occupancy_rate': round((total_registered / event.capacity * 100), 2) if event.capacity and event.capacity > 0 else 100,
                'average_rating': round(average_rating, 2)
            },
            'registered_users': registered_users
        })
        
    except Event.DoesNotExist:
        return Response(
            {
                'success': False,
                'error': 'Evento no encontrado'
            },
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {
                'success': False,
                'error': f'Error al generar el reporte: {str(e)}'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organizer_all_events_report(request):
    """
    Reporte de todos los eventos del organizador
    """
    try:
        user_profile = request.user.profile
        
        # Verificar si es organizador o admin
        if user_profile.role not in ["organizer", "admin"]:
            return Response(
                {
                    'success': False,
                    'error': 'Solo organizadores y administradores pueden ver este reporte'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener todos los eventos creados por este organizador (o todos si es admin)
        if user_profile.role == "admin":
            events = Event.objects.all()
        else:
            events = Event.objects.filter(organizer=user_profile)
        
        events = events.order_by('-start_time')
        
        events_report = []
        total_stats = {
            'total_events': 0,
            'total_registered': 0,
            'total_confirmed': 0,
            'total_attended': 0,
            'total_capacity': 0
        }
        
        for event in events:
            registrations = EventRegistration.objects.filter(event=event)
            confirmed_count = registrations.filter(status="confirmed").count()
            attended_count = registrations.filter(attended=True).count()
            
            event_data = {
                'id': str(event.id),
                'title': event.title,
                'date': event.start_time,
                'end_date': event.end_time,
                'location': event.location,
                'category': event.category.name if event.category else None,
                'capacity': event.capacity,
                'registered_count': registrations.count(),
                'confirmed_count': confirmed_count,
                'attended_count': attended_count,
                'attendance_rate': round((attended_count / confirmed_count * 100), 2) if confirmed_count > 0 else 0,
                'occupancy_rate': round((registrations.count() / event.capacity * 100), 2) if event.capacity and event.capacity > 0 else 100
            }
            events_report.append(event_data)
            
            # Actualizar totales
            total_stats['total_events'] += 1
            total_stats['total_registered'] += registrations.count()
            total_stats['total_confirmed'] += confirmed_count
            total_stats['total_attended'] += attended_count
            total_stats['total_capacity'] += (event.capacity or 0)
        
        # Calcular promedios
        total_stats['avg_attendance_rate'] = round(
            (total_stats['total_attended'] / total_stats['total_confirmed'] * 100) if total_stats['total_confirmed'] > 0 else 0,
            2
        )
        total_stats['avg_occupancy_rate'] = round(
            (total_stats['total_registered'] / total_stats['total_capacity'] * 100) if total_stats['total_capacity'] > 0 else 100,
            2
        )
        
        return Response({
            'success': True,
            'organizer': {
                'id': user_profile.user.id,
                'username': user_profile.user.username,
                'role': user_profile.role
            },
            'total_statistics': total_stats,
            'events': events_report
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Error al generar el reporte: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

# ========== REPORTES PARA ADMINISTRADORES ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_global_report(request):
    """
    Reporte global para administradores
    """
    try:
        # Verificar que el usuario sea admin
        if request.user.profile.role != "admin":
            return Response(
                {
                    'success': False,
                    'error': 'Solo administradores pueden ver este reporte'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Parámetros de fecha (opcionales)
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        # Filtrar eventos por fecha si se proporciona
        events = Event.objects.all()
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d')
                end = datetime.strptime(end_date, '%Y-%m-%d')
                events = events.filter(
                    start_time__date__range=[start.date(), end.date()]
                )
            except ValueError:
                return Response(
                    {
                        'success': False,
                        'error': 'Formato de fecha inválido. Use YYYY-MM-DD'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # 1. Número total de eventos en el período
        total_events = events.count()
        
        # 2. Eventos creados por período (mes)
        events_by_month = events.annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            count=Count('id'),
            avg_registrations=Avg('registrations__id', distinct=True)
        ).order_by('month')
        
        # 3. Eventos más populares (por número de inscritos)
        popular_events = []
        for event in events:
            registration_count = EventRegistration.objects.filter(event=event).count()
            attended_count = EventRegistration.objects.filter(event=event, attended=True).count()
            
            popular_events.append({
                'id': str(event.id),
                'title': event.title,
                'organizer': event.organizer.user.username,
                'date': event.start_time,
                'registered_count': registration_count,
                'attended_count': attended_count,
                'capacity': event.capacity,
                'occupancy_rate': round((registration_count / event.capacity * 100), 2) if event.capacity and event.capacity > 0 else 100,
                'attendance_rate': round((attended_count / registration_count * 100), 2) if registration_count > 0 else 0
            })
        
        # Ordenar por número de inscritos (descendente) y tomar top 10
        popular_events = sorted(popular_events, key=lambda x: x['registered_count'], reverse=True)[:10]
        
        # 4. Distribución de eventos por categoría
        category_distribution = []
        category_stats = events.values('category__name').annotate(
            count=Count('id'),
            avg_capacity=Avg('capacity'),
            avg_registrations=Avg('registrations__id', distinct=True)
        ).order_by('-count')
        
        for stat in category_stats:
            category_distribution.append({
                'category': stat['category__name'] or 'Sin categoría',
                'count': stat['count'],
                'percentage': round((stat['count'] / total_events * 100), 2) if total_events > 0 else 0,
                'avg_capacity': round(stat['avg_capacity'] or 0, 2),
                'avg_registrations': round(stat['avg_registrations'] or 0, 2)
            })
        
        # 5. Estadísticas de usuarios
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        total_users = User.objects.count()
        users_with_profile = User.objects.filter(profile__isnull=False).count()
        
        # 6. Estadísticas de registros
        all_registrations = EventRegistration.objects.all()
        if start_date and end_date:
            all_registrations = all_registrations.filter(
                created_at__date__range=[start.date(), end.date()]
            )
        
        total_registrations = all_registrations.count()
        attended_registrations = all_registrations.filter(attended=True).count()
        attendance_rate = (attended_registrations / total_registrations * 100) if total_registrations > 0 else 0
        
        # 7. Eventos por estado temporal
        now = timezone.now()
        upcoming_events = events.filter(start_time__gt=now).count()
        ongoing_events = events.filter(
            start_time__lte=now,
            end_time__gte=now
        ).count()
        past_events = events.filter(end_time__lt=now).count()
        
        # 8. Estadísticas de organizadores
        organizer_stats = events.values('organizer__user__username').annotate(
            event_count=Count('id'),
            total_registrations=Count('registrations'),
            avg_attendance=Avg('registrations__attended')
        ).order_by('-event_count')[:10]
        
        return Response({
            'success': True,
            'time_period': {
                'start_date': start_date,
                'end_date': end_date,
                'period_days': (end - start).days if start_date and end_date else 'No especificado'
            },
            'summary': {
                'total_events': total_events,
                'total_users': total_users,
                'users_with_profile': users_with_profile,
                'total_registrations': total_registrations,
                'attended_registrations': attended_registrations,
                'attendance_rate': round(attendance_rate, 2),
                'upcoming_events': upcoming_events,
                'ongoing_events': ongoing_events,
                'past_events': past_events
            },
            'events_over_time': {
                'by_month': list(events_by_month)
            },
            'popular_events': popular_events,
            'category_distribution': category_distribution,
            'organizer_stats': list(organizer_stats),
            'event_status_distribution': {
                'upcoming': upcoming_events,
                'ongoing': ongoing_events,
                'past': past_events
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Error al generar el reporte: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_user_analytics(request):
    """
    Analíticas de usuarios para administradores
    """
    try:
        # Verificar que el usuario sea admin
        if request.user.profile.role != "admin":
            return Response(
                {
                    'success': False,
                    'error': 'Solo administradores pueden ver este reporte'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Usuarios más activos (más eventos inscritos)
        active_users = []
        for user in User.objects.filter(profile__isnull=False):
            try:
                profile = user.profile
                events_registered = EventRegistration.objects.filter(user=profile).count()
                events_organized = Event.objects.filter(organizer=profile).count()
                
                if events_registered > 0 or events_organized > 0:
                    active_users.append({
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'role': profile.role,
                        'events_registered': events_registered,
                        'events_organized': events_organized,
                        'total_engagement': events_registered + events_organized,
                        'last_login': user.last_login
                    })
            except:
                continue
        
        # Ordenar por engagement
        active_users = sorted(active_users, key=lambda x: x['total_engagement'], reverse=True)[:20]
        
        # Registro de usuarios por mes
        users_by_month = User.objects.annotate(
            month=TruncMonth('date_joined')
        ).values('month').annotate(count=Count('id')).order_by('month')
        
        # Distribución de roles
        role_distribution = {}
        for profile in Profile.objects.all():
            role = profile.role
            if role not in role_distribution:
                role_distribution[role] = 0
            role_distribution[role] += 1
        
        return Response({
            'success': True,
            'active_users': active_users,
            'user_growth': list(users_by_month),
            'role_distribution': role_distribution
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Error al generar el reporte: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

# ========== VISTA PARA NOTIFICACIONES (PARA EL BADGE) ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_event_notifications(request):
    """
    Obtener eventos del usuario para notificaciones
    """
    try:
        user_profile = request.user.profile
        
        # Obtener todos los registros del usuario con eventos futuros
        now = timezone.now()
        registrations = EventRegistration.objects.filter(
            user=user_profile,
            event__start_time__gt=now  # Solo eventos futuros
        ).select_related('event').order_by('event__start_time')
        
        events_data = []
        for reg in registrations:
            events_data.append({
                'id': str(reg.event.id),
                'title': reg.event.title,
                'date': reg.event.start_time,
                'end_time': reg.event.end_time,
                'location': reg.event.location,
                'registration_id': str(reg.id),
                'registration_status': reg.status,
                'notification_read': reg.notification_read,
                'attended': reg.attended,
                'is_upcoming': reg.event.start_time > now,
                'is_today': reg.event.start_time.date() == now.date()
            })
        
        # Contar notificaciones no leídas
        unread_count = registrations.filter(notification_read=False).count()
        
        return Response({
            'success': True,
            'events': events_data,
            'unread_count': unread_count
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Error al cargar notificaciones: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """
    Marcar todas las notificaciones como leídas
    """
    try:
        user_profile = request.user.profile
        
        # Marcar todas las notificaciones no leídas como leídas
        updated_count = EventRegistration.objects.filter(
            user=user_profile,
            notification_read=False
        ).update(notification_read=True)
        
        return Response({
            'success': True,
            'message': f'Se marcaron {updated_count} notificaciones como leídas',
            'updated_count': updated_count
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Error al marcar notificaciones: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

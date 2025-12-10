from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_reports(request):
    """
    Reportes globales para administradores
    """
    # Verificar si el usuario es admin
    if not request.user.is_staff:
        return Response(
            {"detail": "Solo administradores pueden acceder a estos reportes."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Parámetros de fecha
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    # Filtrar eventos por fecha si se proporciona
    events_qs = Event.objects.all()
    
    if start_date:
        events_qs = events_qs.filter(created_at__gte=start_date)
    if end_date:
        events_qs = events_qs.filter(created_at__lte=end_date)
    
    # Estadísticas generales
    total_events = events_qs.count()
    total_registrations = EventRegistration.objects.filter(event__in=events_qs).count()
    
    # Eventos más populares (por número de inscritos)
    popular_events = events_qs.annotate(
        registration_count=Count('registrations')
    ).order_by('-registration_count')[:10]
    
    # Distribución por categoría
    category_distribution = Category.objects.annotate(
        event_count=Count('events', filter=Q(events__in=events_qs)),
        total_registrations=Count('events__registrations', filter=Q(events__in=events_qs))
    ).values('name', 'event_count', 'total_registrations').order_by('-event_count')
    
    # Eventos recientes
    recent_events = events_qs.order_by('-created_at')[:5]
    
    # Asistencia general
    total_attended = EventRegistration.objects.filter(
        status=RegistrationStatus.ATTENDED,
        event__in=events_qs
    ).count()
    
    return Response({
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "statistics": {
            "total_events": total_events,
            "total_registrations": total_registrations,
            "total_attended": total_attended,
            "global_attendance_rate": round((total_attended / total_registrations * 100) if total_registrations > 0 else 0, 2)
        },
        "popular_events": [
            {
                "id": str(event.id),
                "title": event.title,
                "registrations": event.registration_count,
                "organizer": event.organizer.full_name if event.organizer else "N/A"
            }
            for event in popular_events
        ],
        "category_distribution": list(category_distribution),
        "recent_events": [
            {
                "id": str(event.id),
                "title": event.title,
                "created_at": event.created_at,
                "category": event.category.name if event.category else "Sin categoría"
            }
            for event in recent_events
        ]
    })
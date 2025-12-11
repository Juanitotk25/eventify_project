# backend/event_management/reports.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.db.models import Count, Q
from datetime import datetime, timedelta
from .models import Event, EventRegistration  # Ajusta según tus modelos
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_reports(request):
    # Parámetros de filtro
    period = request.GET.get('period', 'all')
    
    # Base queryset
    events = Event.objects.all()
    
    # Filtrar por período (basado en fecha de creación)
    now = timezone.now()
    if period == 'today':
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        events = events.filter(created_at__gte=start_date)
    elif period == 'week':
        start_date = now - timedelta(days=7)
        events = events.filter(created_at__gte=start_date)
    elif period == 'month':
        start_date = now - timedelta(days=30)
        events = events.filter(created_at__gte=start_date)
    
    # Estadísticas generales
    total_events = events.count()
    
    # Total de inscripciones
    total_registrations = EventRegistration.objects.filter(
        event__in=events
    ).count()
    
    # Total de confirmaciones (ajusta según tu lógica de confirmación)
    total_confirmed = EventRegistration.objects.filter(
        event__in=events,
        attendance_status='attended'  # Ajusta este campo según tu modelo
    ).count()
    
    # Calcular tasa de confirmación
    confirmation_rate = 0
    if total_registrations > 0:
        confirmation_rate = round((total_confirmed / total_registrations) * 100, 2)
    
    # Distribución por categoría
    events_by_category = events.values('category__name').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Convertir a diccionario
    category_dict = {}
    for item in events_by_category:
        category_name = item['category__name'] or 'Sin categoría'
        category_dict[category_name] = item['count']
    
    # Eventos más populares (por número de inscritos)
    popular_events = events.annotate(
        registration_count=Count('registrations')
    ).order_by('-registration_count')[:10]
    
    # Preparar datos de eventos para la respuesta
    events_data = []
    for event in popular_events:
        # Contar confirmaciones para este evento
        confirmed_count = event.registrations.filter(
            attendance_status='attended'
        ).count()
        
        # Determinar estado
        if event.end_time and event.end_time < now:
            status = 'finished'
        elif event.start_time and event.start_time > now:
            status = 'upcoming'
        else:
            status = 'active'
        
        events_data.append({
            'id': event.id,
            'name': event.title,
            'date': event.start_time.strftime('%Y-%m-%d') if event.start_time else None,
            'category': event.category.name if event.category else 'Sin categoría',
            'attendees': event.registration_count,
            'confirmed': confirmed_count,
            'status': status
        })
    
    return Response({
        'events': events_data,
        'stats': {
            'totalEvents': total_events,
            'totalAttendees': total_registrations,  # O usa total_confirmed según lo que quieras mostrar
            'totalRegistrations': total_registrations,
            'totalConfirmed': total_confirmed,
            'confirmationRate': confirmation_rate,
            'eventsByCategory': category_dict
        }
    })
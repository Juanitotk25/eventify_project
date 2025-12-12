# backend/event_management/reports.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from .models import Event, EventRegistration, RegistrationStatus, Category
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['GET'])
def admin_reports(request):
    """
    Endpoint para reportes de administrador.
    Solo usuarios con role='admin' pueden acceder.
    """
    # 1. Verificar autenticación
    if not request.user.is_authenticated:
        return Response({'error': 'No autenticado'}, status=401)
    
    # 2. Verificar si es admin (usando tu campo role en Profile)
    # 2. Verificar si es admin
    if request.user.is_superuser:
        pass # Es superusuario, acceso concedido
    else:
        try:
           if not hasattr(request.user, 'profile') or request.user.profile.role != 'admin':
                return Response({'error': 'No tienes permisos de administrador'}, status=403)
        except Exception as e:
           return Response({'error': f'Error al verificar permisos: {str(e)}'}, status=403)
    
    try:
        # 3. Parámetros de filtro
        period = request.GET.get('period', 'all')
        
        # 4. Obtener eventos
        events = Event.objects.all().select_related('category', 'organizer', 'organizer__user')
        
        # 5. Filtrar por período (si se especifica)
        now = timezone.now()
        if period == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            events = events.filter(start_time__gte=start_date)
        elif period == 'week':
            start_date = now - timedelta(days=7)
            events = events.filter(start_time__gte=start_date)
        elif period == 'month':
            start_date = now - timedelta(days=30)
            events = events.filter(start_time__gte=start_date)
        
        # 6. Estadísticas generales
        total_events = events.count()
        
        # Obtener todas las inscripciones para estos eventos
        registrations = EventRegistration.objects.filter(event__in=events)
        total_registrations = registrations.count()
        
        # Contar por estado
        total_confirmed = registrations.filter(status=RegistrationStatus.CONFIRMED).count()
        total_attended = registrations.filter(status=RegistrationStatus.ATTENDED).count()
        
        # Para reportes, "confirmados" puede incluir tanto CONFIRMED como ATTENDED
        total_confirmed_and_attended = total_confirmed + total_attended
        
        # Tasa de confirmación (incluyendo attended)
        confirmation_rate = 0
        if total_registrations > 0:
            confirmation_rate = round((total_confirmed_and_attended / total_registrations) * 100, 2)
        
        # 7. Distribución por categoría
        events_by_category = events.values('category__name').annotate(
            count=Count('id')
        ).order_by('-count')
        
        category_dict = {}
        for item in events_by_category:
            category_name = item['category__name'] or 'Sin categoría'
            category_dict[category_name] = item['count']
        
        # 8. Eventos más populares (por número de inscripciones)
        events_with_stats = []
        for event in events:
            # Obtener estadísticas de este evento
            event_registrations = EventRegistration.objects.filter(event=event)
            total_for_event = event_registrations.count()
            
            confirmed_for_event = event_registrations.filter(
                status=RegistrationStatus.CONFIRMED
            ).count()
            
            attended_for_event = event_registrations.filter(
                status=RegistrationStatus.ATTENDED
            ).count()
            
            # Calcular tasa de asistencia
            attendance_rate = 0
            if total_for_event > 0:
                attendance_rate = round((attended_for_event / total_for_event) * 100, 2)
            
            # Determinar estado del evento
            if event.end_time and event.end_time < now:
                event_status = 'finished'
            elif event.start_time and event.start_time > now:
                event_status = 'upcoming'
            else:
                event_status = 'active'
            
            events_with_stats.append({
                'id': str(event.id),
                'name': event.title,
                'date': event.start_time.strftime('%Y-%m-%d') if event.start_time else None,
                'time': event.start_time.strftime('%H:%M') if event.start_time else None,
                'category': event.category.name if event.category else 'Sin categoría',
                'organizer': event.organizer.user.username if event.organizer and event.organizer.user else 'Desconocido',
                'location': event.location or 'No especificada',
                'attendees': total_for_event,
                'confirmed': confirmed_for_event,  # Confirmados
                'attended': attended_for_event,    # Que realmente asistieron
                'status': event_status,
                'attendance_rate': attendance_rate,
                'capacity': event.capacity,
                'is_public': event.is_public
            })
        
        # Ordenar por número de asistentes
        events_with_stats.sort(key=lambda x: x['attendees'], reverse=True)
        
        # 9. Estadísticas adicionales
        total_users = User.objects.count()
        
        # 10. Preparar respuesta
        return Response({
            'events': events_with_stats[:50],  # Limitar a 50 eventos
            'stats': {
                'totalEvents': total_events,
                'totalRegistrations': total_registrations,
                'totalConfirmed': total_confirmed,           # Solo CONFIRMED
                'totalAttended': total_attended,             # Solo ATTENDED
                'totalConfirmedAndAttended': total_confirmed_and_attended,  # Ambos
                'confirmationRate': confirmation_rate,
                'totalUsers': total_users,
                'eventsByCategory': category_dict,
                'period': period,
                'generated_at': now.isoformat()
            }
        })
        
    except Exception as e:
        import traceback
        error_details = {
            'error': str(e),
            'traceback': traceback.format_exc()
        }
        print(f"Error en admin_reports: {error_details}")
        return Response({'error': 'Error interno del servidor', 'details': str(e)}, status=500)
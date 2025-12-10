from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet, 
    CategoryViewSet, 
    EventRegistrationViewSet,
    # NUEVAS VISTAS PARA REPORTES
    organizer_event_report,
    organizer_all_events_report,
    admin_global_report,
    admin_user_analytics,
    get_user_event_notifications,
    mark_all_notifications_read
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r"registrations", EventRegistrationViewSet, basename="registration")

urlpatterns = [
    # Rutas existentes del router
    path('', include(router.urls)),
    
    # ==================== REPORTES ====================
    
    # Reportes para organizadores
    path('reports/organizer/event/<uuid:event_id>/', 
         organizer_event_report, 
         name='organizer-event-report'),
    
    path('reports/organizer/all-events/', 
         organizer_all_events_report, 
         name='organizer-all-events-report'),
    
    # Reportes para administradores
    path('reports/admin/global/', 
         admin_global_report, 
         name='admin-global-report'),
    
    path('reports/admin/user-analytics/', 
         admin_user_analytics, 
         name='admin-user-analytics'),
    
    # ================= NOTIFICACIONES =================
    
    # Notificaciones de eventos del usuario (para el badge)
    path('notifications/user-events/', 
         get_user_event_notifications, 
         name='user-events-notifications'),
    
    # Marcar todas las notificaciones como leídas
    path('notifications/mark-all-read/', 
         mark_all_notifications_read, 
         name='mark-all-notifications-read'),
]
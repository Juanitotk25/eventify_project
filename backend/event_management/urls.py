from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import EventViewSet, CategoryViewSet, EventRegistrationViewSet
from . import reports  # Importa el módulo de reports

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r"registrations", EventRegistrationViewSet, basename="registration")

# URLs adicionales para reportes
urlpatterns = [
    path('', include(router.urls)),
    path('admin-reports/', reports.admin_reports, name='admin-reports'),
]

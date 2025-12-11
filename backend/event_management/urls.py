# backend/event_management/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, CategoryViewSet, EventRegistrationViewSet
from . import reports

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r"registrations", EventRegistrationViewSet, basename="registration")

urlpatterns = [
    path('', include(router.urls)),
    path('admin-reports/', reports.admin_reports, name='admin-reports'),
]
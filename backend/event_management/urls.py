from rest_framework.routers import DefaultRouter
from .views import EventViewSet, CategoryViewSet, EventRegistrationViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r"registrations", EventRegistrationViewSet, basename="registration")


urlpatterns = router.urls
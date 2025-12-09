# backend/users/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserNotificationsView, CancelRegistrationView

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('notifications/', UserNotificationsView.as_view(), name='user-notifications'),
    path('cancel-registration/<uuid:registration_id>/', CancelRegistrationView.as_view(), name='cancel-registration'),
]
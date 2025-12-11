# backend/users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, UserNotificationsView, CancelRegistrationView, CustomTokenObtainPairView

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('notifications/', UserNotificationsView.as_view(), name='user-notifications'),
    path('cancel-registration/<uuid:registration_id>/', CancelRegistrationView.as_view(), name='cancel-registration'),
]
# backend/users/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Este endpoint define http://127.0.0.1:8000/api/users/login/
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # ... otras rutas como token/refresh/, register/, etc.
]
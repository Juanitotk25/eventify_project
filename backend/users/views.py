# backend/users/views.py

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import UserSerializer  # Aún no existe, la crearemos

class RegisterView(generics.CreateAPIView):
    # Permite que cualquiera (no autenticado) pueda registrarse
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"message": "Registro exitoso. Ahora puedes iniciar sesión."},
            status=status.HTTP_201_CREATED,
            headers=headers
        )
# backend/users/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User # Usar nuestro modelo de usuario si es personalizado

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True) # Campo solo para escritura

    class Meta:
        model = User # User por defecto de Django
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        # Se Crea el usuario y hashea la contraseña
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
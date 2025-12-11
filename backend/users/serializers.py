# backend/users/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User # Usar nuestro modelo de usuario si es personalizado
from .models import Profile

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

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


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email"]
        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": False}
        }

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["role", "created_at"]
        read_only_fields = ["created_at"]

class UserProfileSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ["username", "email", "profile"]
        extra_kwargs = {
            "email": {"required": False},
            "username": {"required": False},
        }

    def update(self, instance, validated_data):
        # Update User fields
        profile_data = validated_data.pop("profile", {})

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Profile fields
        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()

        return instance


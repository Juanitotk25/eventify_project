# users/models.py

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

# Obtener el modelo de usuario activo de Django
User = get_user_model() 


class UserRole(models.TextChoices):
    STUDENT = "student", "Student"
    ORGANIZER = "organizer", "Organizer"
    ADMIN = "admin", "Admin"


class Profile(models.Model):
    # CRÍTICO: Enlace One-to-One al modelo User de Django.
    # Esto permite que user.profile funcione y corrige los errores 500.
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="profile"
    )
    
    # CAMPOS MANTENIDOS:
    role = models.CharField(
        max_length=16, 
        choices=UserRole.choices, 
        default=UserRole.STUDENT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Campos eliminados: full_name, avatar_url, bio

    def __str__(self) -> str:
        # Usa el username del modelo User de Django
        return self.user.username


@receiver(post_save, sender=get_user_model())
def create_profile_for_new_user(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
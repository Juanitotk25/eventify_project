import uuid
from django.db import models
from django.db.models import Q, F


class UserRole(models.TextChoices):
    STUDENT = "student", "Student"
    ORGANIZER = "organizer", "Organizer"
    ADMIN = "admin", "Admin"


class Profile(models.Model):
    id = models.UUIDField(primary_key=True)  # enlazable a auth.users(id) en Supabase
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    full_name = models.CharField(max_length=255, null=True, blank=True)
    avatar_url = models.URLField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    role = models.CharField(max_length=16, choices=UserRole.choices, default=UserRole.STUDENT)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.username or f"Profile {self.id}"
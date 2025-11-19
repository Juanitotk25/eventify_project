import uuid
from django.db import models
from django.db.models import Q, F
from users.models import Profile
import django_filters


class RegistrationStatus(models.TextChoices):
    REGISTERED = "registered", "Registered"
    CONFIRMED = "confirmed", "Confirmed"
    ATTENDED = "attended", "Attended"
    CANCELLED = "cancelled", "Cancelled"
    WAITLISTED = "waitlisted", "Waitlisted"


class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)

    def __str__(self) -> str:
        return self.name


class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organizer = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="organized_events",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events",
    )
    location = models.CharField(max_length=255, null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)
    is_public = models.BooleanField(default=True)
    cover_url = models.URLField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(end_time__isnull=True) | Q(start_time__lt=F("end_time")),
                name="event_start_before_end_or_no_end",
            ),
        ]
        indexes = [
            models.Index(fields=["start_time"], name="idx_events_start_time"),
            models.Index(fields=["category"], name="idx_events_category_id"),
        ]

    def __str__(self) -> str:
        return self.title


class EventRegistration(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="registrations",
    )
    user = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="registrations",
    )
    status = models.CharField(
        max_length=16,
        choices=RegistrationStatus.choices,
        default=RegistrationStatus.REGISTERED,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["event", "user"],
                name="ux_event_user_unique",
            ),
        ]
        indexes = [
            models.Index(fields=["event"], name="idx_registrations_event"),
            models.Index(fields=["user"], name="idx_registrations_user"),
        ]

    def __str__(self) -> str:
        return f"{self.user} → {self.event} ({self.status})"

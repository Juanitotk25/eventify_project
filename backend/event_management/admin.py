from django.contrib import admin
from .models import Category, Event, EventRegistration


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'organizer', 'category', 'start_time', 'is_public', 'capacity')
    list_filter = ('is_public', 'category', 'start_time', 'created_at')
    search_fields = ('title', 'description', 'location', 'organizer__username')
    readonly_fields = ('id', 'created_at', 'updated_at')
    date_hierarchy = 'start_time'
    fieldsets = (
        ('Información básica', {
            'fields': ('id', 'title', 'description', 'organizer')
        }),
        ('Detalles del evento', {
            'fields': ('category', 'location', 'start_time', 'end_time', 'capacity', 'is_public')
        }),
        ('Medios', {
            'fields': ('cover_url', 'metadata')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'event__category')
    search_fields = ('user__username', 'event__title')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Registro', {
            'fields': ('id', 'user', 'event', 'status')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
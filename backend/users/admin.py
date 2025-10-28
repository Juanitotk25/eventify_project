from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('username', 'full_name', 'role', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('username', 'full_name', 'bio')
    readonly_fields = ('id', 'created_at')
    fieldsets = (
        ('Información básica', {
            'fields': ('id', 'username', 'full_name', 'role')
        }),
        ('Perfil', {
            'fields': ('avatar_url', 'bio')
        }),
        ('Fechas', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
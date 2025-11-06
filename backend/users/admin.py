# users/admin.py (CORREGIDO)

from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    # Función para mostrar el username del modelo User, accesible a través del enlace 'user'
    def user_username(self, obj):
        return obj.user.username
    
    # Función para mostrar el ID (clave primaria, que es el ID del User)
    def user_id(self, obj):
        return obj.user.id

    list_display = [
        'user_id',          # Muestra el ID del usuario
        'user_username',    # Muestra el username (accediendo a user.username)
        'role',             # Campo que mantuviste
        'created_at',
    ]
    
    # readonly_fields debe referirse a atributos existentes en ProfileAdmin o Profile
    readonly_fields = [
        'user_id', 
        'user_username', 
        'created_at'
    ] 
    
    # Permite buscar por el username del usuario enlazado
    search_fields = ['user__username', 'role'] 
    
    # El campo 'user' que es la clave foránea no debería ser editable directamente
    fields = [
        'user', 
        'role'
    ]
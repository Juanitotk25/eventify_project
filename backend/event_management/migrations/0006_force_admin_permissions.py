# Generated manually to force superuser permissions

from django.db import migrations
from django.contrib.auth import get_user_model

def force_superuser_permissions(apps, schema_editor):
    User = get_user_model()
    username = 'admin'
    
    try:
        user = User.objects.get(username=username)
        print(f"Encontrado usuario {username}. Actualizando permisos...")
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print("Permisos de superusuario asignados correctamente.")
    except User.DoesNotExist:
        print(f"El usuario {username} no existe. Se creará con la migración anterior.")

class Migration(migrations.Migration):

    dependencies = [
        ('event_management', '0005_create_superuser'),
    ]

    operations = [
        migrations.RunPython(force_superuser_permissions),
    ]

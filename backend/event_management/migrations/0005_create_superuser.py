# Generated manually to create superuser

from django.db import migrations
from django.contrib.auth import get_user_model

def create_superuser(apps, schema_editor):
    User = get_user_model()
    username = 'admin'
    email = 'admin@example.com'
    password = 'admin123'
    
    if not User.objects.filter(username=username).exists():
        print(f"Creando superusuario: {username}")
        User.objects.create_superuser(username=username, email=email, password=password)
    else:
        print(f"El superusuario {username} ya existe.")

class Migration(migrations.Migration):

    dependencies = [
        ('event_management', '0004_remove_technology_category'),
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]

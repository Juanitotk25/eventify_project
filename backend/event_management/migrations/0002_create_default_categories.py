# Generated migration to create default categories

from django.db import migrations


def create_default_categories(apps, schema_editor):
    """Crear categorías por defecto si no existen"""
    Category = apps.get_model('event_management', 'Category')
    
    default_categories = [
        {'name': 'Académico', 'description': 'Eventos relacionados con actividades académicas'},
        {'name': 'Cultural', 'description': 'Eventos culturales y artísticos'},
        {'name': 'Deportivo', 'description': 'Eventos deportivos y recreativos'},
        {'name': 'Social', 'description': 'Eventos sociales y de networking'},
        {'name': 'Tecnología', 'description': 'Eventos de tecnología e innovación'},
        {'name': 'Networking', 'description': 'Eventos de networking profesional'},
    ]
    
    for cat_data in default_categories:
        # Crear solo si no existe
        Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )


class Migration(migrations.Migration):

    dependencies = [
        ('event_management', '0001_initial'),  # Cambia esto al nombre de tu última migración
    ]

    operations = [
        migrations.RunPython(create_default_categories),
    ]

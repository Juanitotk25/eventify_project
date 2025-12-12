# Generated migration to create default categories

from django.db import migrations


def create_default_categories(apps, schema_editor):
    """Crear categorías por defecto si no existen"""
    Category = apps.get_model('event_management', 'Category')
    
    default_categories = [
        'Académico',
        'Cultural',
        'Deportivo',
        'Social',
        'Networking',
    ]
    
    for cat_name in default_categories:
        # Crear solo si no existe
       Category.objects.get_or_create(name=cat_name)


class Migration(migrations.Migration):

    dependencies = [
        ('event_management', '0002_eventregistration_comment_eventregistration_rating'),
    ]

    operations = [
        migrations.RunPython(create_default_categories),
    ]

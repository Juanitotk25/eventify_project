# Generated migration to create default categories

from django.db import migrations


def create_default_categories(apps, schema_editor):
    """Crear categorías por defecto si no existen"""
    Category = apps.get_model('event_management', 'Category')
    
    default_categories = [
    ]

    operations = [
        migrations.RunPython(create_default_categories),
    ]

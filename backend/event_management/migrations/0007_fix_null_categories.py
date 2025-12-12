# Generated manually to fix null categories

from django.db import migrations

def fix_null_categories(apps, schema_editor):
    Event = apps.get_model('event_management', 'Event')
    Category = apps.get_model('event_management', 'Category')
    
    # Obtener categoría por defecto (ej. 'Social')
    # Usamos filter().first() para evitar errores si no existe (aunque debería)
    default_cat = Category.objects.filter(name='Social').first()
    
    if not default_cat:
        # Si no existe Social, intentar con cualquiera
        default_cat = Category.objects.first()
        
    if default_cat:
        # Actualizar eventos con categoría nula
        count = Event.objects.filter(category__isnull=True).update(category=default_cat)
        print(f"Se actualizaron {count} eventos con categoría nula a '{default_cat.name}'.")
    else:
        print("No se encontraron categorías para asignar por defecto.")

class Migration(migrations.Migration):

    dependencies = [
        ('event_management', '0006_force_admin_permissions'),
    ]

    operations = [
        migrations.RunPython(fix_null_categories),
    ]

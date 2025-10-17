#!/usr/bin/env python
"""
Script simple para probar que los modelos funcionen correctamente
"""
import os
import sys
import django
from django.conf import settings

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eventify_project.settings')
django.setup()

from users.models import Profile, UserRole
from event_management.models import Category, Event, EventRegistration, RegistrationStatus
import uuid
from datetime import datetime, timedelta

def test_models():
    print("🧪 Probando modelos de Eventify...")
    
    try:
        # 1. Crear un perfil
        print("\n1. Creando perfil de usuario...")
        profile = Profile.objects.create(
            id=uuid.uuid4(),
            username="test_user",
            full_name="Usuario de Prueba",
            role=UserRole.STUDENT,
            bio="Usuario creado para pruebas"
        )
        print(f"✅ Perfil creado: {profile}")
        
        # 2. Crear una categoría
        print("\n2. Creando categoría...")
        category = Category.objects.create(name="Tecnología")
        print(f"✅ Categoría creada: {category}")
        
        # 3. Crear un evento
        print("\n3. Creando evento...")
        start_time = datetime.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=2)
        
        event = Event.objects.create(
            organizer=profile,
            title="Evento de Prueba",
            description="Descripción del evento de prueba",
            category=category,
            location="Ubicación de prueba",
            start_time=start_time,
            end_time=end_time,
            capacity=50,
            is_public=True
        )
        print(f"✅ Evento creado: {event}")
        
        # 4. Crear un registro
        print("\n4. Creando registro de evento...")
        registration = EventRegistration.objects.create(
            event=event,
            user=profile,
            status=RegistrationStatus.REGISTERED
        )
        print(f"✅ Registro creado: {registration}")
        
        # 5. Probar consultas
        print("\n5. Probando consultas...")
        print(f"   - Total de perfiles: {Profile.objects.count()}")
        print(f"   - Total de categorías: {Category.objects.count()}")
        print(f"   - Total de eventos: {Event.objects.count()}")
        print(f"   - Total de registros: {EventRegistration.objects.count()}")
        
        # 6. Probar relaciones
        print("\n6. Probando relaciones...")
        print(f"   - Eventos organizados por {profile.username}: {profile.organized_events.count()}")
        print(f"   - Registros de {profile.username}: {profile.registrations.count()}")
        print(f"   - Registros del evento '{event.title}': {event.registrations.count()}")
        
        print("\n🎉 ¡Todos los modelos funcionan correctamente!")
        print("\n📋 Resumen de la prueba:")
        print(f"   - Perfil: {profile.username} ({profile.role})")
        print(f"   - Categoría: {category.name}")
        print(f"   - Evento: {event.title} (organizado por {event.organizer.username})")
        print(f"   - Registro: {registration.user.username} → {registration.event.title} ({registration.status})")
        
    except Exception as e:
        print(f"❌ Error durante la prueba: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_models()
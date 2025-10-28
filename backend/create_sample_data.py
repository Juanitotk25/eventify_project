#!/usr/bin/env python
"""
Script para crear datos de ejemplo en el proyecto Eventify
"""
import os
import sys
import django
from django.conf import settings

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eventify_project.settings')
django.setup()

from users.models import Profile
from event_management.models import Category, Event, EventRegistration
import uuid
from datetime import datetime, timedelta

def create_sample_data():
    print("Creando datos de ejemplo para Eventify...")
    
    # Crear perfiles de ejemplo
    profiles = []
    for i in range(5):
        profile = Profile.objects.create(
            id=uuid.uuid4(),
            username=f"usuario{i+1}",
            full_name=f"Usuario {i+1}",
            role="student" if i < 3 else "organizer",
            bio=f"Biografía del usuario {i+1}"
        )
        profiles.append(profile)
        print(f"✓ Creado perfil: {profile.username}")
    
    # Crear categorías
    categories = []
    category_names = ["Tecnología", "Deportes", "Arte", "Educación", "Música"]
    for name in category_names:
        category = Category.objects.create(name=name)
        categories.append(category)
        print(f"✓ Creada categoría: {category.name}")
    
    # Crear eventos
    events = []
    for i in range(8):
        start_time = datetime.now() + timedelta(days=i*2, hours=i*3)
        end_time = start_time + timedelta(hours=2)
        
        event = Event.objects.create(
            organizer=profiles[i % len(profiles)],
            title=f"Evento {i+1}: {category_names[i % len(category_names)]}",
            description=f"Descripción detallada del evento {i+1}",
            category=categories[i % len(categories)],
            location=f"Ubicación {i+1}",
            start_time=start_time,
            end_time=end_time,
            capacity=50 + i*10,
            is_public=True,
            cover_url=f"https://example.com/cover{i+1}.jpg"
        )
        events.append(event)
        print(f"✓ Creado evento: {event.title}")
    
    # Crear registros de eventos
    for i in range(15):
        event = events[i % len(events)]
        user = profiles[i % len(profiles)]
        
        registration = EventRegistration.objects.create(
            event=event,
            user=user,
            status="registered" if i % 3 == 0 else "confirmed"
        )
        print(f"✓ Creado registro: {user.username} → {event.title}")
    
    print("\n🎉 ¡Datos de ejemplo creados exitosamente!")
    print(f"📊 Resumen:")
    print(f"   - Perfiles: {Profile.objects.count()}")
    print(f"   - Categorías: {Category.objects.count()}")
    print(f"   - Eventos: {Event.objects.count()}")
    print(f"   - Registros: {EventRegistration.objects.count()}")

if __name__ == "__main__":
    create_sample_data()
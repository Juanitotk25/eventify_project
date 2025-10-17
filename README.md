# Eventify - Sistema de Gestión de Eventos

## Descripción
Eventify es un sistema de gestión de eventos desarrollado con Django que permite a los usuarios crear, gestionar y registrarse en eventos.

## Estructura del Proyecto

### Aplicaciones Django

#### 1. `users` - Gestión de Usuarios
- **Modelo**: `Profile`
- **Funcionalidad**: Gestión de perfiles de usuario con roles (student, organizer, admin)
- **Campos principales**:
  - `id`: UUID (compatible con Supabase Auth)
  - `username`: Nombre de usuario único
  - `full_name`: Nombre completo
  - `role`: Rol del usuario (student/organizer/admin)
  - `avatar_url`: URL del avatar
  - `bio`: Biografía del usuario

#### 2. `event_management` - Gestión de Eventos
- **Modelos**:
  - `Category`: Categorías de eventos
  - `Event`: Eventos principales
  - `EventRegistration`: Registros de usuarios a eventos

- **Funcionalidades**:
  - Creación y gestión de eventos
  - Sistema de categorías
  - Registro de usuarios a eventos
  - Control de capacidad
  - Estados de registro (registered, confirmed, attended, cancelled, waitlisted)

## Modelos de Base de Datos

### Profile (users/models.py)
```python
class Profile(models.Model):
    id = models.UUIDField(primary_key=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    full_name = models.CharField(max_length=255, null=True, blank=True)
    avatar_url = models.URLField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    role = models.CharField(max_length=16, choices=UserRole.choices, default=UserRole.STUDENT)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Event (event_management/models.py)
```python
class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organizer = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="organized_events")
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="events")
    location = models.CharField(max_length=255, null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)
    is_public = models.BooleanField(default=True)
    cover_url = models.URLField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### EventRegistration (event_management/models.py)
```python
class EventRegistration(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="registrations")
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="registrations")
    status = models.CharField(max_length=16, choices=RegistrationStatus.choices, default=RegistrationStatus.REGISTERED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## Características Técnicas

### Constraints y Validaciones
- **UniqueConstraint**: Un usuario solo puede registrarse una vez por evento
- **CheckConstraint**: La hora de inicio debe ser anterior a la hora de fin
- **Índices optimizados**: Para consultas eficientes por fecha, categoría y usuario

### Enums y Choices
- **UserRole**: student, organizer, admin
- **RegistrationStatus**: registered, confirmed, attended, cancelled, waitlisted

### Relaciones
- **Profile → Event**: Un organizador puede crear múltiples eventos
- **Event → EventRegistration**: Un evento puede tener múltiples registros
- **Profile → EventRegistration**: Un usuario puede registrarse en múltiples eventos

## Instalación y Configuración

### Requisitos
- Python 3.8+
- Django 5.0+

### Pasos de instalación

#### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd desarrollo-proyecto
```

#### 2. Crear y activar entorno virtual
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
```

#### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

#### 4. Configurar base de datos
```bash
python manage.py migrate
```

#### 5. Crear superusuario (opcional)
```bash
python manage.py createsuperuser
```

#### 6. Ejecutar servidor de desarrollo
```bash
python manage.py runserver
```

#### 7. Acceder a la aplicación
- Aplicación principal: `http://127.0.0.1:8000/`
- Panel de administración: `http://127.0.0.1:8000/admin/`

### Gestión del Entorno Virtual

#### Activar/Desactivar entorno virtual
```bash
# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Desactivar entorno virtual
deactivate
```

#### Verificar que el entorno esté activo
Cuando el entorno virtual esté activo, verás `(venv)` al inicio de tu prompt:
```bash
(venv) PS C:\Users\usuario\proyecto>
```

### Comandos útiles
```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear datos de ejemplo
python create_sample_data.py

# Ejecutar servidor de desarrollo
python manage.py runserver

# Verificar configuración del proyecto
python manage.py check

# Acceder al shell de Django
python manage.py shell
```

## Panel de Administración

El proyecto incluye configuración completa del panel de administración de Django con:
- Gestión de perfiles de usuario
- Gestión de categorías
- Gestión de eventos
- Gestión de registros
- Filtros y búsquedas avanzadas

Acceder a: `http://localhost:8000/admin/`

## Estructura de Archivos

```
desarrollo-proyecto/
├── venv/                           # Entorno virtual (no incluir en git)
│   ├── Scripts/                     # Scripts de activación (Windows)
│   ├── Lib/                         # Librerías instaladas
│   └── ...
├── eventify_project/                # Proyecto Django principal
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── users/                           # App de usuarios
│   ├── models.py
│   ├── admin.py
│   └── migrations/
├── event_management/                # App de gestión de eventos
│   ├── models.py
│   ├── admin.py
│   └── migrations/
├── manage.py                        # Script principal de Django
├── db.sqlite3                      # Base de datos SQLite
├── requirements.txt                # Dependencias del proyecto
├── create_sample_data.py           # Script para datos de ejemplo
├── test_models.py                  # Script de pruebas
└── README.md                       # Este archivo
```

### Archivos importantes
- **`requirements.txt`**: Lista de dependencias Python
- **`venv/`**: Entorno virtual (no versionar en git)
- **`db.sqlite3`**: Base de datos SQLite (no versionar en git)
- **`.gitignore`**: Archivos a ignorar en git (recomendado)

## Próximos Pasos

1. Implementar API REST con Django REST Framework
2. Crear vistas y templates para frontend
3. Implementar autenticación JWT
4. Agregar tests unitarios
5. Configurar para producción con PostgreSQL/Supabase
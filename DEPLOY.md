# 🚀 GUÍA DE DESPLIEGUE - EVENTIFY EN RENDER

Esta guía te llevará paso a paso para desplegar tu aplicación Eventify (Django + React) en Render.

---

## 📋 PASO 1: PREPARACIÓN PREVIA

### 1.1 Asegúrate de que tus cambios estén en GitHub

```powershell
cd "c:\Users\jpjda\Downloads\proyecto eventify\eventify_project"
git status
git add .
git commit -m "Preparar proyecto para despliegue en Render"
git push origin main
```

✅ **Verificación**: Ve a https://github.com/Juanitotk25/eventify_project y confirma que los archivos se subieron.

### 1.2 Genera una SECRET_KEY segura para Django

Abre una terminal con Python y ejecuta:

```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

📝 **Copia esta clave**, la necesitarás en el Paso 3.

---

## 🗄️ PASO 2: CREAR BASE DE DATOS POSTGRESQL

1. Ve a https://dashboard.render.com/
2. Click en **"New +"** (arriba derecha)
3. Selecciona **"PostgreSQL"**
4. Configuración:
   - **Name**: `eventify-db`
   - **Database**: `eventify_db` (automático)
   - **User**: `eventify_user` (automático)
   - **Region**: Selecciona el más cercano (ej: Oregon)
   - **PostgreSQL Version**: 16 (o la última)
   - **Plan**: **Free** ✅
5. Click en **"Create Database"**
6. **Espera 2-3 minutos** mientras se crea

### 2.1 Copia la URL de la base de datos

Una vez creada la base de datos:
- En la página de la base de datos, busca **"Internal Database URL"**
- Click en el ícono de copiar 📋
- Guardala temporalmente (la necesitarás en el siguiente paso)

Se verá algo así:
```
postgresql://eventify_user:contraseña@dpg-xxxxx/eventify_db
```

---

## 🐍 PASO 3: DESPLEGAR BACKEND (Django)

1. En el Dashboard de Render, click en **"New +"** → **"Web Service"**
2. Click en **"Connect a repository"**
   - Autoriza GitHub si es necesario
   - Selecciona: **`Juanitotk25/eventify_project`**
3. Configuración del servicio:

| Campo | Valor |
|-------|-------|
| **Name** | `eventify-backend` |
| **Region** | El mismo que elegiste para la DB |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `./build.sh` |
| **Start Command** | `gunicorn eventify_project.wsgi:application` |
| **Instance Type** | **Free** |

4. Click en **"Advanced"** para agregar variables de entorno

### 3.1 Variables de Entorno del Backend

Click en **"Add Environment Variable"** para cada una:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | La clave que generaste en el Paso 1.2 |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `.onrender.com` |
| `DATABASE_URL` | La URL que copiaste en el Paso 2.1 |
| `FRONTEND_URL` | `http://localhost:3000` (actualizarás después) |

5. Click en **"Create Web Service"**

### 3.2 Espera el despliegue

- Verás los logs en pantalla
- El proceso toma **5-10 minutos** la primera vez
- Cuando termine dirá: ✅ **"Live"** en verde

### 3.3 Prueba el backend

- Copia la URL de tu servicio (ej: `https://eventify-backend.onrender.com`)
- Abre en tu navegador: `https://eventify-backend.onrender.com/api/`
- Deberías ver la página de la API de Django REST Framework

---

## ⚛️ PASO 4: DESPLEGAR FRONTEND (React)

1. En el Dashboard de Render, click en **"New +"** → **"Static Site"**
2. Selecciona el mismo repositorio: **`Juanitotk25/eventify_project`**
3. Configuración:

| Campo | Valor |
|-------|-------|
| **Name** | `eventify-frontend` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |

4. Click en **"Advanced"** → **"Add Environment Variable"**

### 4.1 Variable de Entorno del Frontend

| Key | Value |
|-----|-------|
| `REACT_APP_API_BASE` | `https://eventify-backend.onrender.com` |

*(Usa la URL real de tu backend del Paso 3.3)*

5. Click en **"Create Static Site"**

### 4.2 Espera el build

- Toma **3-5 minutos**
- Cuando termine: ✅ **"Published"**

---

## 🔗 PASO 5: CONECTAR FRONTEND CON BACKEND (CORS)

Ahora necesitas actualizar el backend para permitir peticiones desde tu frontend:

1. Ve al servicio **`eventify-backend`** en Render
2. Click en **"Environment"** (menú izquierdo)
3. Encuentra la variable `FRONTEND_URL`
4. Cambia el valor a: `https://eventify-frontend.onrender.com`
   *(Usa la URL real de tu frontend)*
5. Click en **"Save Changes"**
6. El backend se **redesplegarará automáticamente** (toma 2-3 minutos)

---

## ✅ PASO 6: VERIFICACIÓN FINAL

### 6.1 Prueba la aplicación completa

1. Abre tu frontend: `https://eventify-frontend.onrender.com`
2. Prueba:
   - ✅ Registro de usuario nuevo
   - ✅ Login con tu usuario
   - ✅ Crear un evento
   - ✅ Ver lista de eventos
   - ✅ Unirse a un evento

### 6.2 Si algo no funciona

**Ver logs del backend:**
- Dashboard → `eventify-backend` → **"Logs"**

**Ver logs del frontend:**
- Dashboard → `eventify-frontend` → **"Events"**

**Errores comunes:**
- **CORS Error**: Verifica que `FRONTEND_URL` tenga la URL correcta
- **500 Server Error**: Revisa las variables de entorno del backend
- **Build Failed**: Revisa los logs y asegúrate que `requirements.txt` tiene todas las dependencias

---

## 🎉 ¡FELICITACIONES!

Tu aplicación Eventify ya está desplegada y accesible desde cualquier parte del mundo.

### 📝 URLs Importantes:

- **Frontend**: `https://eventify-frontend.onrender.com`
- **Backend API**: `https://eventify-backend.onrender.com/api/`
- **Admin Django**: `https://eventify-backend.onrender.com/admin/`

### 🔄 Para futuras actualizaciones:

Cada vez que hagas `git push origin main`, Render redespleará automáticamente:
- ✅ **Auto-deploy** está activado por defecto
- ⏱️ Los cambios se reflejan en 3-10 minutos

---

## 💡 TIPS IMPORTANTES

1. **Plan Free de Render**:
   - Los servicios free "duermen" después de 15 min de inactividad
   - La primera carga después de dormir toma ~30 segundos
   - PostgreSQL free tiene 90 días gratis, luego tiene costo

2. **Para evitar que duerma**:
   - Usa un servicio como UptimeRobot (gratis) para pingear tu app cada 10 min

3. **Crear superusuario de Django**:
   ```bash
   # En Render Dashboard → eventify-backend → Shell
   python manage.py createsuperuser
   ```

4. **Ver la base de datos**:
   - Render Dashboard → `eventify-db` → Connect
   - Usa las credenciales para conectarte con herramientas como pgAdmin

---

**¿Problemas o preguntas?** Revisa los logs en el Dashboard de Render o contacta al soporte de Render (muy bueno y rápido).

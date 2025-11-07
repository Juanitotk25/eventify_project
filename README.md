# Eventify

Eventify is a web platform to create, manage, and discover events.
Built with Django (backend) and React (frontend) to simplify event organization and attendance.

🧭 Project Structure
eventify_project/
├── backend/              # Django API
├── frontend/             # React frontend
├── manage.py             # Django management script
└── README.md

💡 Main Technologies
Area	Stack
Backend	Django 5, Django REST Framework, SQLite/PostgreSQL
Frontend	React + Vite + Tailwind CSS
Auth	JWT (rest_framework_simplejwt)
UI	Chakra UI, Axios, React Router
🚀 Setup & Run Locally

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/Juanitotk25/eventify_project.git
cd eventify_project
```

2️⃣ Backend setup (Django)
Create and activate virtual environment
```bash
cd backend
python -m venv venv
# Activate environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

Install dependencies
```bash
pip install -r requirements.txt
```

Apply migrations and start the server
```bash
python manage.py migrate
python manage.py runserver
```


The API will be available at: http://127.0.0.1:8000/api/

3️⃣ Frontend setup (React)
```bash
cd ../frontend
npm install
npm start
```

Then open: http://localhost:3000

(Make sure the backend server is running first.)


🧱 Architecture

Clear MVC structure in Django

Logic split into serializers, views, urls, and models

JWT-based authentication

Modular React components and protected routes

Custom hooks for API interaction

Tailwind CSS + Chakra UI for fast styling

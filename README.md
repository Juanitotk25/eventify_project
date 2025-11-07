🎟️ Eventify

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
1️⃣ Clone the repository
git clone https://github.com/Juanitotk25/eventify_project.git
cd eventify_project

2️⃣ Backend setup (Django)
Create and activate virtual environment
cd backend
python -m venv venv
# Activate environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

Install dependencies
pip install -r requirements.txt

Create .env file in backend/
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3

Apply migrations and start the server
python manage.py migrate
python manage.py runserver


The API will be available at: http://127.0.0.1:8000/api/

3️⃣ Frontend setup (React)
cd ../frontend
npm install
npm run dev


Then open: http://localhost:5173

(Make sure the backend server is running first.)

⚙️ Environment Variables
Backend (.env)
SECRET_KEY=...
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3

Frontend (.env)
VITE_API_URL=http://127.0.0.1:8000/api

🧪 Running Tests

Backend:

python manage.py test


Frontend (if configured):

npm run test

🧱 Architecture

Clear MVC structure in Django

Logic split into serializers, views, urls, and models

JWT-based authentication

Modular React components and protected routes

Custom hooks for API interaction

Tailwind CSS + Chakra UI for fast styling

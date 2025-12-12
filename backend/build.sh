#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Collectstatic sin base de datos (usa archivos estáticos solamente)
python manage.py collectstatic --no-input

# Migrate usa PostgreSQL (DATABASE_URL está disponible)
python manage.py migrate

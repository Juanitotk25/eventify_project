#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Temporalmente quitar DATABASE_URL para usar SQLite en collectstatic
unset DATABASE_URL

python manage.py collectstatic --no-input

# DATABASE_URL se restaurará automáticamente para migrate y runtime
python manage.py migrate

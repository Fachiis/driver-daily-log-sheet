#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py makemigrations

# Run database migrations
python manage.py migrate

# Create superuser if environment variables are set
python manage.py create_superuser_with_password

# Collect static files (if needed in future)
python manage.py collectstatic --no-input


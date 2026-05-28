#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput --clear 2>/dev/null || true

if [ "$DJANGO_SETTINGS_MODULE" = "config.settings.production" ]; then
  exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers "${GUNICORN_WORKERS:-3}" \
    --timeout "${GUNICORN_TIMEOUT:-60}"
fi

exec python manage.py runserver 0.0.0.0:8000

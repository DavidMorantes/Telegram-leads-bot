#!/usr/bin/env bash
set -euo pipefail

# setup.sh — Initial project setup for local development
# Usage: bash scripts/setup.sh

echo "=== telegram-lead-qualifier setup ==="

# 1. Copy env file if missing
if [ ! -f .env ]; then
    cp .env.example .env
    echo "[OK] .env created from .env.example — edit it with your keys."
else
    echo "[OK] .env already exists."
fi

# 2. Build Docker images
echo "Building Docker images..."
docker compose build

# 3. Start services
echo "Starting services..."
docker compose up -d

# 4. Wait for database
echo "Waiting for database..."
until docker compose exec db pg_isready -U postgres 2>/dev/null; do
    sleep 1
done
echo "[OK] Database is ready."

# 5. Run migrations
echo "Running migrations..."
docker compose run --rm backend python manage.py migrate

# 6. Collect static files
echo "Collecting static files..."
docker compose run --rm backend python manage.py collectstatic --noinput

echo ""
echo "=== Setup complete ==="
echo "Backend:  http://localhost:8000/"
echo "Frontend: http://localhost:5173/"
echo "Admin:    http://localhost:8000/admin/"
echo ""
echo "Run 'make createsuperuser' to create an admin user."

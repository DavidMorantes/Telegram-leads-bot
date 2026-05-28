.PHONY: build up down logs backend-shell migrate makemigrations createsuperuser test lint format

DC = docker compose
EXEC_BACKEND = $(DC) exec backend
RUN_BACKEND = $(DC) run --rm backend

build:
	$(DC) build

up:
	$(DC) up -d

down:
	$(DC) down

logs:
	$(DC) logs -f

backend-shell:
	$(EXEC_BACKEND) sh

django-shell:
	$(EXEC_BACKEND) python manage.py shell

migrate:
	$(RUN_BACKEND) python manage.py migrate

makemigrations:
	$(RUN_BACKEND) python manage.py makemigrations

createsuperuser:
	$(RUN_BACKEND) python manage.py createsuperuser

test:
	$(RUN_BACKEND) python -m pytest

lint:
	$(RUN_BACKEND) ruff check .

format:
	$(RUN_BACKEND) ruff format .

collectstatic:
	$(RUN_BACKEND) python manage.py collectstatic --noinput

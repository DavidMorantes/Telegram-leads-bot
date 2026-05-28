import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

app = Celery("telegram_lead_qualifier")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.task
def debug_task() -> str:
    return "celery-ready"

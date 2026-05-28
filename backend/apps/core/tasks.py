from celery import shared_task


@shared_task
def healthcheck_task():
    """Minimal placeholder task to validate Celery wiring."""
    return {"status": "queued"}

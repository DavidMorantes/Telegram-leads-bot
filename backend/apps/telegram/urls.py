from django.urls import path

from apps.telegram.views import TelegramWebhookView

urlpatterns = [
    path("webhook/", TelegramWebhookView.as_view(), name="telegram-webhook"),
]

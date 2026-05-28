from django.conf import settings
from rest_framework import permissions, viewsets

from apps.bots.models import Bot
from apps.bots.serializers import BotSerializer


class BotViewSet(viewsets.ModelViewSet):
    serializer_class = BotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Bot.objects.select_related("default_icp", "llm_provider_config", "sheet_config")
            .filter(owner=self.request.user)
            .order_by("name")
        )
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        return queryset

    def perform_create(self, serializer):
        webhook_secret = serializer.validated_data.get("webhook_secret") or getattr(
            settings,
            "TELEGRAM_WEBHOOK_SECRET",
            "",
        )
        serializer.save(owner=self.request.user, webhook_secret=webhook_secret)

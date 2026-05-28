from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class Bot(TimeStampedModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bots",
        null=True,
        blank=True,
        help_text="Owner of this bot configuration. TODO: make non-null after migrating legacy data.",
    )
    name = models.CharField(max_length=120)
    telegram_username = models.CharField(max_length=120, blank=True)
    telegram_token = models.CharField(
        max_length=255,
        help_text="TODO: replace with encrypted secret storage before production.",
    )
    webhook_secret = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    default_icp = models.ForeignKey(
        "icps.ICP",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="default_for_bots",
    )
    llm_provider_config = models.ForeignKey(
        "llm.LLMProviderConfig",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bots",
    )
    sheet_config = models.ForeignKey(
        "sheets.SheetConfig",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bots",
    )

    class Meta:
        ordering = ("name",)
        indexes = [models.Index(fields=["owner", "name"])]

    def __str__(self) -> str:
        return self.name

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class SheetConfig(TimeStampedModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sheet_configs",
        null=True,
        blank=True,
        help_text="Owner of this sheets configuration. TODO: make non-null after migrating legacy data.",
    )
    name = models.CharField(max_length=120)
    spreadsheet_id = models.CharField(max_length=255)
    worksheet_name = models.CharField(max_length=120)
    credentials_json = models.TextField(
        blank=True,
        help_text="TODO: replace with encrypted secret storage before production.",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)
        indexes = [models.Index(fields=["owner", "name"])]

    def __str__(self) -> str:
        return self.name

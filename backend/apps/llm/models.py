from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class LLMProviderChoices(models.TextChoices):
    GROQ = "groq", "Groq"
    OPENAI = "openai", "OpenAI"
    ANTHROPIC = "anthropic", "Anthropic"
    GEMINI = "gemini", "Gemini"
    MOCK = "mock", "Mock"


class LLMProviderConfig(TimeStampedModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="llm_provider_configs",
        null=True,
        blank=True,
        help_text="Owner of this provider configuration. TODO: make non-null after migrating legacy data.",
    )
    provider = models.CharField(max_length=30, choices=LLMProviderChoices.choices)
    name = models.CharField(max_length=120)
    model = models.CharField(max_length=120)
    api_key = models.CharField(
        max_length=255,
        blank=True,
        help_text="TODO: replace with encrypted secret storage before production.",
    )
    base_url = models.URLField(blank=True)
    temperature = models.DecimalField(max_digits=4, decimal_places=2, default=0.20)
    max_tokens = models.PositiveIntegerField(default=512)
    timeout_seconds = models.PositiveIntegerField(default=30)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)
        indexes = [models.Index(fields=["owner", "name"])]

    def __str__(self) -> str:
        return f"{self.name} ({self.provider})"

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class ICP(TimeStampedModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="icps",
        null=True,
        blank=True,
        help_text="Owner of this ICP. TODO: make non-null after migrating legacy data.",
    )
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    min_employees = models.PositiveIntegerField(null=True, blank=True)
    allowed_regions = models.JSONField(default=list, blank=True)
    allowed_industries = models.JSONField(default=list, blank=True)
    required_interests = models.JSONField(default=list, blank=True)
    exclusion_rules = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)
        indexes = [models.Index(fields=["owner", "name"])]

    def __str__(self) -> str:
        return self.name


class PromptTemplate(TimeStampedModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="prompt_templates",
        null=True,
        blank=True,
        help_text="Owner of this prompt template. TODO: make non-null after migrating legacy data.",
    )
    icp = models.ForeignKey(ICP, on_delete=models.CASCADE, related_name="prompt_templates")
    name = models.CharField(max_length=120)
    system_prompt = models.TextField()
    output_schema = models.JSONField(default=dict, blank=True)
    version = models.CharField(max_length=50, default="v1")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("icp__name", "name", "-created_at")
        unique_together = ("icp", "name", "version")
        indexes = [models.Index(fields=["owner", "name"])]

    def __str__(self) -> str:
        return f"{self.icp.name} - {self.name} ({self.version})"

from django.conf import settings
from django.db import models

from apps.bots.models import Bot
from apps.icps.models import ICP, PromptTemplate


class LeadDecision(models.TextChoices):
    QUALIFIED = "qualified", "Qualified"
    NOT_QUALIFIED = "not_qualified", "Not qualified"
    UNCERTAIN = "uncertain", "Uncertain"
    FAILED = "failed", "Failed"


class SheetStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    SUCCESS = "success", "Success"
    FAILED = "failed", "Failed"
    SKIPPED = "skipped", "Skipped"


class Lead(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="leads",
        null=True,
        blank=True,
        help_text="Owner of this lead. TODO: make non-null after migrating legacy data.",
    )
    bot = models.ForeignKey(Bot, on_delete=models.CASCADE, related_name="leads")
    icp = models.ForeignKey(ICP, on_delete=models.SET_NULL, null=True, blank=True, related_name="leads")
    prompt_template = models.ForeignKey(
        PromptTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="leads",
    )
    telegram_chat_id = models.CharField(max_length=120)
    telegram_message_id = models.CharField(max_length=120)
    raw_text = models.TextField()
    decision = models.CharField(max_length=20, choices=LeadDecision.choices, default=LeadDecision.UNCERTAIN)
    reason = models.TextField(blank=True)
    confidence = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    extracted_data = models.JSONField(default=dict, blank=True)
    llm_provider = models.CharField(max_length=50, blank=True)
    llm_model = models.CharField(max_length=120, blank=True)
    input_tokens = models.PositiveIntegerField(default=0)
    output_tokens = models.PositiveIntegerField(default=0)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    sheet_status = models.CharField(max_length=20, choices=SheetStatus.choices, default=SheetStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["owner", "created_at"]),
            models.Index(fields=["bot", "created_at"]),
            models.Index(fields=["decision"]),
            models.Index(fields=["sheet_status"]),
        ]

    def __str__(self) -> str:
        return f"Lead {self.id} - {self.decision}"

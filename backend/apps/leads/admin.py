from django.contrib import admin

from apps.leads.models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "owner",
        "bot",
        "icp",
        "prompt_template",
        "decision",
        "confidence",
        "sheet_status",
        "llm_provider",
        "created_at",
    )
    list_filter = ("owner", "decision", "sheet_status", "bot", "icp", "llm_provider")
    search_fields = ("raw_text", "telegram_chat_id", "telegram_message_id", "reason", "owner__username")

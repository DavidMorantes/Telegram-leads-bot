from django.contrib import admin

from apps.bots.models import Bot


@admin.register(Bot)
class BotAdmin(admin.ModelAdmin):
    list_display = (
        "owner",
        "name",
        "telegram_username",
        "is_active",
        "default_icp",
        "llm_provider_config",
        "sheet_config",
        "created_at",
        "updated_at",
    )
    list_filter = ("owner", "is_active", "default_icp", "llm_provider_config", "sheet_config")
    search_fields = ("name", "telegram_username", "owner__username")

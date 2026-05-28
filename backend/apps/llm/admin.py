from django.contrib import admin

from apps.llm.models import LLMProviderConfig


@admin.register(LLMProviderConfig)
class LLMProviderConfigAdmin(admin.ModelAdmin):
    list_display = ("owner", "name", "provider", "model", "temperature", "max_tokens", "is_active", "created_at", "updated_at")
    list_filter = ("owner", "provider", "is_active")
    search_fields = ("name", "model", "provider", "owner__username")

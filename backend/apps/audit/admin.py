from django.contrib import admin

from apps.audit.models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "entity_type", "entity_id", "actor", "ip_address", "created_at")
    list_filter = ("action", "entity_type")
    search_fields = ("entity_type", "entity_id", "action")

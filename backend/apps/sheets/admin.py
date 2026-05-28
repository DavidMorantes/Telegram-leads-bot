from django.contrib import admin

from apps.sheets.models import SheetConfig


@admin.register(SheetConfig)
class SheetConfigAdmin(admin.ModelAdmin):
    list_display = ("owner", "name", "spreadsheet_id", "worksheet_name", "is_active", "created_at", "updated_at")
    list_filter = ("owner", "is_active",)
    search_fields = ("name", "spreadsheet_id", "worksheet_name", "owner__username")

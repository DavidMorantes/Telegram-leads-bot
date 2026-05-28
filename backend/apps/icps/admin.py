from django.contrib import admin

from apps.icps.models import ICP, PromptTemplate


@admin.register(ICP)
class ICPAdmin(admin.ModelAdmin):
    list_display = ("owner", "name", "min_employees", "is_active", "created_at", "updated_at")
    list_filter = ("owner", "is_active",)
    search_fields = ("name", "description", "owner__username")


@admin.register(PromptTemplate)
class PromptTemplateAdmin(admin.ModelAdmin):
    list_display = ("owner", "name", "icp", "version", "is_active", "created_at", "updated_at")
    list_filter = ("owner", "is_active", "icp")
    search_fields = ("name", "icp__name", "version", "owner__username")

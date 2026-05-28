from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.views import AdminLoginView, AdminProfileView, AdminTokenRefreshView, UserViewSet
from apps.bots.views import BotViewSet
from apps.icps.views import ICPViewSet, PromptTemplateViewSet
from apps.leads.views import LeadViewSet
from apps.llm.views import LLMProviderConfigViewSet
from apps.sheets.views import SheetConfigViewSet


class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({"status": "ok", "service": "telegram-lead-qualifier"})


router = DefaultRouter()
router.register("auth/users", UserViewSet, basename="user")
router.register("bots", BotViewSet, basename="bot")
router.register("icps", ICPViewSet, basename="icp")
router.register("prompt-templates", PromptTemplateViewSet, basename="prompt-template")
router.register("leads", LeadViewSet, basename="lead")
router.register("llm/provider-configs", LLMProviderConfigViewSet, basename="llm-provider")
router.register("sheets/configs", SheetConfigViewSet, basename="sheet-config")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthCheckView.as_view(), name="health-check"),
    path("api/auth/login/", AdminLoginView.as_view(), name="admin-login"),
    path("api/auth/refresh/", AdminTokenRefreshView.as_view(), name="admin-refresh"),
    path("api/auth/me/", AdminProfileView.as_view(), name="admin-profile"),
    path("api/telegram/", include("apps.telegram.urls")),
    path("api/", include(router.urls)),
]

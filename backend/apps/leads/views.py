from rest_framework import permissions, viewsets

from apps.leads.models import Lead
from apps.leads.serializers import LeadSerializer


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Lead.objects.select_related("bot__sheet_config", "icp", "prompt_template").filter(owner=self.request.user).order_by("-created_at")
        bot_id = self.request.query_params.get("bot")
        icp_id = self.request.query_params.get("icp")
        decision = self.request.query_params.get("decision")
        sheet_status = self.request.query_params.get("sheet_status")
        if bot_id:
            queryset = queryset.filter(bot_id=bot_id)
        if icp_id:
            queryset = queryset.filter(icp_id=icp_id)
        if decision:
            queryset = queryset.filter(decision=decision)
        if sheet_status:
            queryset = queryset.filter(sheet_status=sheet_status)
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

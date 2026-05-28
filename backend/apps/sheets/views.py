from rest_framework import permissions, viewsets

from apps.sheets.models import SheetConfig
from apps.sheets.serializers import SheetConfigSerializer


class SheetConfigViewSet(viewsets.ModelViewSet):
    serializer_class = SheetConfigSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = SheetConfig.objects.filter(owner=self.request.user).order_by("name")
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

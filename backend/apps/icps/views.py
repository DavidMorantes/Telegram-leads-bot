from rest_framework import permissions, viewsets

from apps.icps.models import ICP, PromptTemplate
from apps.icps.serializers import ICPSerializer, PromptTemplateSerializer


class ICPViewSet(viewsets.ModelViewSet):
    serializer_class = ICPSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ICP.objects.filter(owner=self.request.user).order_by("name")
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PromptTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = PromptTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = PromptTemplate.objects.select_related("icp").filter(owner=self.request.user).order_by("name")
        is_active = self.request.query_params.get("is_active")
        icp_id = self.request.query_params.get("icp")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        if icp_id:
            queryset = queryset.filter(icp_id=icp_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

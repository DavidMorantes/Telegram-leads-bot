from rest_framework import permissions, viewsets

from apps.llm.models import LLMProviderConfig
from apps.llm.serializers import LLMProviderConfigSerializer


class LLMProviderConfigViewSet(viewsets.ModelViewSet):
    serializer_class = LLMProviderConfigSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = LLMProviderConfig.objects.filter(owner=self.request.user).order_by("name")
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

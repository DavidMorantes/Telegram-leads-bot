from django.contrib.auth import get_user_model
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.serializers import AdminLoginSerializer, UserCreateSerializer, UserSerializer
from apps.audit.models import AuditLog
from apps.core.permissions import IsStaffUser

User = get_user_model()


class UserViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all().order_by("id")
    permission_classes = [IsStaffUser]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer


class AdminLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user_payload = serializer.validated_data["user"]
        AuditLog.objects.create(
            actor_id=user_payload["id"],
            action="user_login",
            entity_type="user",
            entity_id=str(user_payload["id"]),
            after={"username": user_payload["username"]},
            ip_address=self._get_client_ip(request),
        )
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

    @staticmethod
    def _get_client_ip(request):
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")


class AdminProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class AdminTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

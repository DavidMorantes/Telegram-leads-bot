from rest_framework import serializers

from apps.bots.models import Bot
from apps.icps.models import ICP
from apps.llm.models import LLMProviderConfig
from apps.sheets.models import SheetConfig


class BotSerializer(serializers.ModelSerializer):
    telegram_token = serializers.CharField(write_only=True, required=False, allow_blank=True)
    telegram_token_masked = serializers.SerializerMethodField(read_only=True)
    default_icp = serializers.PrimaryKeyRelatedField(queryset=ICP.objects.none(), allow_null=True, required=False)
    llm_provider_config = serializers.PrimaryKeyRelatedField(
        queryset=LLMProviderConfig.objects.none(),
        allow_null=True,
        required=False,
    )
    sheet_config = serializers.PrimaryKeyRelatedField(queryset=SheetConfig.objects.none(), allow_null=True, required=False)

    class Meta:
        model = Bot
        fields = (
            "id",
            "name",
            "telegram_username",
            "telegram_token",
            "telegram_token_masked",
            "webhook_secret",
            "is_active",
            "default_icp",
            "llm_provider_config",
            "sheet_config",
            "created_at",
            "updated_at",
        )
        extra_kwargs = {
            "webhook_secret": {"write_only": True, "required": False, "allow_blank": True},
        }

    def get_telegram_token_masked(self, obj):
        token = obj.telegram_token or ""
        if len(token) <= 4:
            return "*" * len(token)
        return f"{token[:2]}{'*' * max(len(token) - 4, 1)}{token[-2:]}"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return
        self.fields["default_icp"].queryset = ICP.objects.filter(owner=request.user)
        self.fields["llm_provider_config"].queryset = LLMProviderConfig.objects.filter(owner=request.user)
        self.fields["sheet_config"].queryset = SheetConfig.objects.filter(owner=request.user)

    def validate(self, attrs):
        if self.instance is None and not attrs.get("telegram_token"):
            raise serializers.ValidationError({"telegram_token": "This field is required."})
        return attrs

    def update(self, instance, validated_data):
        telegram_token = validated_data.pop("telegram_token", None)
        if telegram_token:
            instance.telegram_token = telegram_token
        elif telegram_token == "":
            validated_data.pop("telegram_token", None)

        webhook_secret = validated_data.pop("webhook_secret", None)
        if webhook_secret is not None and webhook_secret != "":
            instance.webhook_secret = webhook_secret

        return super().update(instance, validated_data)

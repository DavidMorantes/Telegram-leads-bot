from rest_framework import serializers

from apps.llm.models import LLMProviderConfig


class LLMProviderConfigSerializer(serializers.ModelSerializer):
    api_key = serializers.CharField(write_only=True, required=False, allow_blank=True)
    api_key_masked = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LLMProviderConfig
        fields = (
            "id",
            "provider",
            "name",
            "model",
            "api_key",
            "api_key_masked",
            "base_url",
            "temperature",
            "max_tokens",
            "timeout_seconds",
            "is_active",
            "created_at",
            "updated_at",
        )

    def get_api_key_masked(self, obj):
        api_key = obj.api_key or ""
        if len(api_key) <= 4:
            return "*" * len(api_key)
        return f"{api_key[:2]}{'*' * max(len(api_key) - 4, 1)}{api_key[-2:]}"

    def validate(self, attrs):
        if self.instance is None and not attrs.get("api_key"):
            raise serializers.ValidationError({"api_key": "This field is required."})
        return attrs

    def update(self, instance, validated_data):
        api_key = validated_data.pop("api_key", None)
        if api_key:
            instance.api_key = api_key
        elif api_key == "":
            validated_data.pop("api_key", None)
        return super().update(instance, validated_data)

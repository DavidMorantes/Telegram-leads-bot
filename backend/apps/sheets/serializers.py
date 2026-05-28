from rest_framework import serializers

from apps.sheets.models import SheetConfig


class SheetConfigSerializer(serializers.ModelSerializer):
    credentials_json = serializers.CharField(write_only=True, required=False, allow_blank=True)
    credentials_json_masked = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SheetConfig
        fields = (
            "id",
            "name",
            "spreadsheet_id",
            "worksheet_name",
            "credentials_json",
            "credentials_json_masked",
            "is_active",
            "created_at",
            "updated_at",
        )

    def get_credentials_json_masked(self, obj):
        if not obj.credentials_json:
            return ""
        return "[configured]"

    def validate(self, attrs):
        if self.instance is None and not attrs.get("credentials_json"):
            raise serializers.ValidationError({"credentials_json": "This field is required."})
        return attrs

    def update(self, instance, validated_data):
        credentials_json = validated_data.pop("credentials_json", None)
        if credentials_json:
            instance.credentials_json = credentials_json
        elif credentials_json == "":
            validated_data.pop("credentials_json", None)
        return super().update(instance, validated_data)

from rest_framework import serializers

from apps.icps.models import ICP, PromptTemplate


class PromptTemplateSerializer(serializers.ModelSerializer):
    icp = serializers.PrimaryKeyRelatedField(queryset=ICP.objects.none())

    class Meta:
        model = PromptTemplate
        fields = (
            "id",
            "icp",
            "name",
            "system_prompt",
            "output_schema",
            "version",
            "is_active",
            "created_at",
            "updated_at",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return
        self.fields["icp"].queryset = ICP.objects.filter(owner=request.user)


class ICPSerializer(serializers.ModelSerializer):
    prompt_templates = PromptTemplateSerializer(many=True, read_only=True)

    class Meta:
        model = ICP
        fields = (
            "id",
            "name",
            "description",
            "min_employees",
            "allowed_regions",
            "allowed_industries",
            "required_interests",
            "exclusion_rules",
            "is_active",
            "created_at",
            "updated_at",
            "prompt_templates",
        )

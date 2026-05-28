from rest_framework import serializers

from apps.bots.models import Bot
from apps.icps.models import ICP, PromptTemplate
from apps.leads.models import Lead
from apps.sheets.services import GoogleSheetsService


class LeadSerializer(serializers.ModelSerializer):
    bot = serializers.PrimaryKeyRelatedField(queryset=Bot.objects.none())
    icp = serializers.PrimaryKeyRelatedField(queryset=ICP.objects.none(), allow_null=True, required=False)
    prompt_template = serializers.PrimaryKeyRelatedField(
        queryset=PromptTemplate.objects.none(),
        allow_null=True,
        required=False,
    )
    sheet_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lead
        fields = (
            "id",
            "bot",
            "icp",
            "prompt_template",
            "telegram_chat_id",
            "telegram_message_id",
            "raw_text",
            "decision",
            "reason",
            "confidence",
            "extracted_data",
            "llm_provider",
            "llm_model",
            "input_tokens",
            "output_tokens",
            "estimated_cost",
            "sheet_status",
            "sheet_url",
            "created_at",
        )
        read_only_fields = (
            "decision",
            "reason",
            "confidence",
            "extracted_data",
            "llm_provider",
            "llm_model",
            "input_tokens",
            "output_tokens",
            "estimated_cost",
            "sheet_status",
            "sheet_url",
            "created_at",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return
        self.fields["bot"].queryset = Bot.objects.filter(owner=request.user)
        self.fields["icp"].queryset = ICP.objects.filter(owner=request.user)
        self.fields["prompt_template"].queryset = PromptTemplate.objects.filter(owner=request.user)

    def get_sheet_url(self, obj):
        sheet_config = getattr(getattr(obj, "bot", None), "sheet_config", None)
        return GoogleSheetsService.build_sheet_url(getattr(sheet_config, "spreadsheet_id", ""))

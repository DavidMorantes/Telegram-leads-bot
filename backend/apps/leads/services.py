from decimal import Decimal

from django.core.exceptions import ValidationError

from apps.core.exceptions import IntegrationConfigurationError
from apps.icps.models import PromptTemplate
from apps.leads.models import Lead, LeadDecision, SheetStatus
from apps.llm.providers.base import LeadQualificationResult
from apps.llm.services import get_llm_provider
from apps.sheets.services import GoogleSheetsService


class QualifyLeadService:
    """Coordinate lead qualification without coupling views to provider details."""

    @classmethod
    def qualify(
        cls,
        *,
        bot,
        raw_text: str,
        telegram_chat_id: str | None = None,
        telegram_message_id: str | None = None,
    ) -> Lead:
        if not bot.is_active:
            raise ValidationError("Bot is inactive.")

        icp = bot.default_icp if bot.default_icp and bot.default_icp.is_active else None
        prompt_template = cls._get_active_prompt(icp) if icp else None
        provider_config = bot.llm_provider_config if bot.llm_provider_config and bot.llm_provider_config.is_active else None
        sheet_status = (
            SheetStatus.PENDING
            if bot.sheet_config and bot.sheet_config.is_active
            else SheetStatus.SKIPPED
        )

        if not icp:
            return cls._create_failed_lead(
                bot=bot,
                raw_text=raw_text,
                telegram_chat_id=telegram_chat_id,
                telegram_message_id=telegram_message_id,
                reason="Bot has no active default ICP configured.",
                sheet_status=sheet_status,
            )
        if not prompt_template:
            return cls._create_failed_lead(
                bot=bot,
                icp=icp,
                raw_text=raw_text,
                telegram_chat_id=telegram_chat_id,
                telegram_message_id=telegram_message_id,
                reason="No active prompt template found for the default ICP.",
                sheet_status=sheet_status,
            )
        if not provider_config:
            return cls._create_failed_lead(
                bot=bot,
                icp=icp,
                prompt_template=prompt_template,
                raw_text=raw_text,
                telegram_chat_id=telegram_chat_id,
                telegram_message_id=telegram_message_id,
                reason="Bot has no active LLM provider configuration.",
                sheet_status=sheet_status,
            )

        prompt = cls._build_prompt(prompt_template=prompt_template)

        try:
            provider = get_llm_provider(provider_config)
            result = provider.analyze_lead(prompt=prompt, context={"raw_text": raw_text, "icp_id": icp.id})
            cls._validate_result(result)
        except IntegrationConfigurationError as exc:
            return cls._create_failed_lead(
                bot=bot,
                icp=icp,
                prompt_template=prompt_template,
                raw_text=raw_text,
                telegram_chat_id=telegram_chat_id,
                telegram_message_id=telegram_message_id,
                reason=str(exc),
                sheet_status=sheet_status,
                llm_provider=provider_config.provider,
                llm_model=provider_config.model,
            )
        except Exception as exc:
            return cls._create_failed_lead(
                bot=bot,
                icp=icp,
                prompt_template=prompt_template,
                raw_text=raw_text,
                telegram_chat_id=telegram_chat_id,
                telegram_message_id=telegram_message_id,
                reason=f"Unexpected provider error: {exc}",
                sheet_status=sheet_status,
                llm_provider=provider_config.provider,
                llm_model=provider_config.model,
            )

        lead = Lead.objects.create(
            owner=bot.owner,
            bot=bot,
            icp=icp,
            prompt_template=prompt_template,
            telegram_chat_id=telegram_chat_id or "",
            telegram_message_id=telegram_message_id or "",
            raw_text=raw_text,
            decision=result.decision,
            reason=result.reason,
            confidence=Decimal(str(result.confidence)) if result.confidence is not None else None,
            extracted_data=result.extracted_data,
            llm_provider=result.provider or provider_config.provider,
            llm_model=result.model or provider_config.model,
            input_tokens=result.input_tokens,
            output_tokens=result.output_tokens,
            estimated_cost=Decimal(str(result.estimated_cost)),
            sheet_status=sheet_status,
        )

        if sheet_status == SheetStatus.PENDING:
            sync_result = GoogleSheetsService().append_lead_log(lead)
            lead.sheet_status = sync_result.get("status", SheetStatus.FAILED)
            lead.save(update_fields=["sheet_status"])

        return lead

    @staticmethod
    def _get_active_prompt(icp):
        return (
            PromptTemplate.objects.filter(icp=icp, is_active=True)
            .order_by("-created_at")
            .first()
        )

    @staticmethod
    def _build_prompt(*, prompt_template):
        output_schema = prompt_template.output_schema or {
            "decision": "qualified | not_qualified | uncertain | failed",
            "reason": "short explanation",
            "confidence": "number between 0 and 1",
            "extracted_data": {},
        }
        return (
            f"{prompt_template.system_prompt}\n\n"
            "Return strict JSON that matches this schema exactly:\n"
            f"{output_schema}\n\n"
            "Do not include markdown fences or commentary."
        )

    @staticmethod
    def _validate_result(result: LeadQualificationResult):
        if result.decision not in LeadDecision.values:
            raise IntegrationConfigurationError("Provider returned an invalid lead decision.")
        if result.confidence is not None and not 0 <= float(result.confidence) <= 1:
            raise IntegrationConfigurationError("Provider returned an invalid confidence value.")

    @staticmethod
    def _create_failed_lead(
        *,
        bot,
        raw_text,
        reason,
        sheet_status,
        telegram_chat_id=None,
        telegram_message_id=None,
        icp=None,
        prompt_template=None,
        llm_provider="",
        llm_model="",
    ):
        return Lead.objects.create(
            owner=bot.owner,
            bot=bot,
            icp=icp,
            prompt_template=prompt_template,
            telegram_chat_id=telegram_chat_id or "",
            telegram_message_id=telegram_message_id or "",
            raw_text=raw_text,
            decision=LeadDecision.FAILED,
            reason=reason,
            extracted_data={},
            llm_provider=llm_provider,
            llm_model=llm_model,
            input_tokens=0,
            output_tokens=0,
            estimated_cost=Decimal("0"),
            sheet_status=sheet_status,
        )

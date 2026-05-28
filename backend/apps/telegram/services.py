import logging

import requests
from requests import RequestException, Timeout

from apps.leads.models import LeadDecision, SheetStatus


logger = logging.getLogger(__name__)


class TelegramBotMessenger:
    """Small wrapper around Telegram's sendMessage API."""

    API_BASE_URL = "https://api.telegram.org"

    @classmethod
    def send_message(cls, *, bot, chat_id: str | int, text: str) -> bool:
        if not chat_id:
            return False

        try:
            response = requests.post(
                f"{cls.API_BASE_URL}/bot{bot.telegram_token}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": text,
                    "disable_web_page_preview": True,
                },
                timeout=10,
            )
            response.raise_for_status()
        except (RequestException, Timeout) as exc:
            logger.warning("Could not send Telegram message for bot %s: %s", bot.id, exc)
            return False

        return True


class TelegramConversationService:
    WELCOME_TEXT = (
        "Hola, soy tu asistente de calificacion de leads.\n\n"
        "Enviame el texto completo del lead: mensaje, necesidad, empresa, presupuesto, region "
        "o cualquier dato disponible.\n\n"
        "Con eso lo clasifico contra el ICP configurado y te devuelvo la decision."
    )
    PROCESSING_TEXT = "Recibido. Estoy clasificando el lead contra el ICP configurado..."

    DECISION_LABELS = {
        LeadDecision.QUALIFIED: "Calificado",
        LeadDecision.NOT_QUALIFIED: "No calificado",
        LeadDecision.UNCERTAIN: "Incierto",
        LeadDecision.FAILED: "No se pudo clasificar",
    }
    SHEET_LABELS = {
        SheetStatus.PENDING: "pendiente de sincronizar",
        SheetStatus.SUCCESS: "sincronizado",
        SheetStatus.FAILED: "fallo al sincronizar",
        SheetStatus.SKIPPED: "omitido",
    }

    @classmethod
    def is_help_command(cls, text: str) -> bool:
        command = text.strip().split(maxsplit=1)[0].lower()
        return command in {"/start", "/help", "/ayuda"}

    @classmethod
    def build_result_message(cls, lead) -> str:
        decision = cls.DECISION_LABELS.get(lead.decision, lead.decision)
        sheet_status = cls.SHEET_LABELS.get(lead.sheet_status, lead.sheet_status)
        confidence = "N/D" if lead.confidence is None else f"{float(lead.confidence):.0%}"
        reason = lead.reason or "Sin motivo detallado."

        return (
            "Clasificacion lista.\n\n"
            f"Decision: {decision}\n"
            f"Confianza: {confidence}\n"
            f"Motivo: {reason}\n"
            f"Lead ID: {lead.id}\n"
            f"Sheets: {sheet_status}\n\n"
            "Puedes enviar otro texto de lead cuando quieras."
        )

from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bots.models import Bot
from apps.leads.services import QualifyLeadService
from apps.telegram.services import TelegramBotMessenger, TelegramConversationService


class TelegramWebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.data
        if not isinstance(payload, dict):
            return Response({"detail": "Invalid payload."}, status=status.HTTP_400_BAD_REQUEST)

        bot = self._resolve_bot(request)
        if not bot:
            return Response(
                {"detail": "Invalid or missing webhook secret."},
                status=status.HTTP_403_FORBIDDEN,
            )

        update_id = payload.get("update_id")
        message = payload.get("message") or payload.get("edited_message") or {}
        chat = message.get("chat") or {}
        raw_text = message.get("text") or ""
        telegram_message_id = message.get("message_id")

        if not raw_text:
            welcome_sent = TelegramBotMessenger.send_message(
                bot=bot,
                chat_id=chat.get("id"),
                text=TelegramConversationService.WELCOME_TEXT,
            )
            return Response(
                {
                    "status": "ignored",
                    "update_id": update_id,
                    "reason": "Message does not contain text.",
                    "telegram_response_sent": welcome_sent,
                },
                status=status.HTTP_202_ACCEPTED,
            )

        if TelegramConversationService.is_help_command(raw_text):
            welcome_sent = TelegramBotMessenger.send_message(
                bot=bot,
                chat_id=chat.get("id"),
                text=TelegramConversationService.WELCOME_TEXT,
            )
            return Response(
                {
                    "status": "help_sent",
                    "update_id": update_id,
                    "chat_id": chat.get("id"),
                    "telegram_response_sent": welcome_sent,
                },
                status=status.HTTP_200_OK,
            )

        processing_sent = TelegramBotMessenger.send_message(
            bot=bot,
            chat_id=chat.get("id"),
            text=TelegramConversationService.PROCESSING_TEXT,
        )

        try:
            lead = QualifyLeadService.qualify(
                bot=bot,
                raw_text=raw_text,
                telegram_chat_id=str(chat.get("id") or ""),
                telegram_message_id=str(telegram_message_id or ""),
            )
        except ValidationError as exc:
            return Response(
                {"status": "error", "update_id": update_id, "detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            return Response(
                {"status": "error", "update_id": update_id, "detail": f"Unhandled webhook error: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        result_sent = TelegramBotMessenger.send_message(
            bot=bot,
            chat_id=chat.get("id"),
            text=TelegramConversationService.build_result_message(lead),
        )

        return Response(
            {
                "status": "processed",
                "update_id": update_id,
                "bot_id": bot.id,
                "chat_id": chat.get("id"),
                "lead_id": lead.id,
                "decision": lead.decision,
                "sheet_status": lead.sheet_status,
                "message_present": bool(message),
                "telegram_processing_sent": processing_sent,
                "telegram_response_sent": result_sent,
            },
            status=status.HTTP_200_OK,
        )

    def _resolve_bot(self, request):
        secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token", "")
        if not secret:
            return None
        return Bot.objects.filter(is_active=True, webhook_secret=secret).first()

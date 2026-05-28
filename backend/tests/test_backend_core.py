from django.test import TestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch
from rest_framework.test import APIClient

from apps.bots.models import Bot
from apps.icps.models import ICP, PromptTemplate
from apps.leads.models import Lead, LeadDecision, SheetStatus
from apps.leads.services import QualifyLeadService
from apps.llm.models import LLMProviderChoices, LLMProviderConfig
from apps.llm.providers.mock import MockLLMProvider
from apps.sheets.models import SheetConfig

User = get_user_model()


class BackendCoreModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="StrongPass123!")
        self.icp = ICP.objects.create(
            owner=self.user,
            name="SMB SaaS",
            description="Qualified business ICP",
            allowed_regions=["LATAM"],
            allowed_industries=["SaaS"],
            required_interests=["automation"],
            exclusion_rules=["students"],
        )
        self.prompt_template = PromptTemplate.objects.create(
            owner=self.user,
            icp=self.icp,
            name="Default qualification",
            system_prompt="Classify the lead against the ICP.",
            output_schema={"decision": "string"},
            version="v1",
            is_active=True,
        )
        self.provider_config = LLMProviderConfig.objects.create(
            owner=self.user,
            provider=LLMProviderChoices.MOCK,
            name="Mock Provider",
            model="mock-1",
            is_active=True,
        )
        self.sheet_config = SheetConfig.objects.create(
            owner=self.user,
            name="Main Sheet",
            spreadsheet_id="sheet-123",
            worksheet_name="Leads",
            credentials_json='{"type":"service_account"}',
            is_active=True,
        )

    def test_create_bot(self):
        bot = Bot.objects.create(
            owner=self.user,
            name="Sales Bot",
            telegram_username="sales_bot",
            telegram_token="secret-token",
            webhook_secret="secret-webhook",
            default_icp=self.icp,
            llm_provider_config=self.provider_config,
            sheet_config=self.sheet_config,
        )
        self.assertEqual(bot.name, "Sales Bot")
        self.assertEqual(bot.default_icp, self.icp)

    def test_create_icp(self):
        self.assertEqual(self.icp.name, "SMB SaaS")
        self.assertTrue(self.icp.is_active)

    def test_create_lead(self):
        bot = Bot.objects.create(
            owner=self.user,
            name="Inbound Bot",
            telegram_username="inbound_bot",
            telegram_token="another-secret",
            default_icp=self.icp,
            llm_provider_config=self.provider_config,
        )
        lead = Lead.objects.create(
            owner=self.user,
            bot=bot,
            icp=self.icp,
            prompt_template=self.prompt_template,
            telegram_chat_id="101",
            telegram_message_id="202",
            raw_text="Interested in a demo for our 50 employees team.",
            decision=LeadDecision.UNCERTAIN,
            sheet_status=SheetStatus.PENDING,
        )
        self.assertEqual(lead.bot, bot)
        self.assertEqual(lead.prompt_template, self.prompt_template)


class MockLLMProviderTests(TestCase):
    def test_mock_provider_returns_reasonable_result(self):
        provider = MockLLMProvider()
        result = provider.analyze_lead(
            prompt="Classify this lead.",
            context={"raw_text": "We are looking for demo options for our team of 25 employees."},
        )

        self.assertEqual(result.decision, LeadDecision.QUALIFIED)
        self.assertGreater(result.confidence or 0, 0.5)
        self.assertEqual(result.provider, "mock")


class QualifyLeadServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="lead-owner", password="StrongPass123!")
        self.icp = ICP.objects.create(
            owner=self.user,
            name="Growth Companies",
            description="B2B ICP",
            allowed_regions=["LATAM"],
            allowed_industries=["Technology"],
            required_interests=["automation"],
            exclusion_rules=["personal use"],
        )
        self.prompt_template = PromptTemplate.objects.create(
            owner=self.user,
            icp=self.icp,
            name="Qualification v1",
            system_prompt="Classify the lead against the ICP and return JSON.",
            output_schema={"decision": "string", "reason": "string"},
            version="v1",
            is_active=True,
        )
        self.provider_config = LLMProviderConfig.objects.create(
            owner=self.user,
            provider=LLMProviderChoices.MOCK,
            name="Mock Provider",
            model="mock-1",
            is_active=True,
        )
        self.sheet_config = SheetConfig.objects.create(
            owner=self.user,
            name="Leads Sheet",
            spreadsheet_id="sheet-001",
            worksheet_name="Qualified Leads",
            credentials_json='{"type":"service_account"}',
            is_active=True,
        )
        self.bot = Bot.objects.create(
            owner=self.user,
            name="Qualifier Bot",
            telegram_username="qualifier_bot",
            telegram_token="bot-token",
            webhook_secret="hook-secret",
            default_icp=self.icp,
            llm_provider_config=self.provider_config,
            sheet_config=self.sheet_config,
            is_active=True,
        )

    @patch("apps.leads.services.GoogleSheetsService.append_lead_log")
    def test_qualify_lead_service_with_mock_provider(self, append_lead_log):
        append_lead_log.return_value = {"status": SheetStatus.SUCCESS, "reason": "Lead appended."}

        lead = QualifyLeadService.qualify(
            bot=self.bot,
            raw_text="Our company has 80 employees and we are looking for a demo with budget approved.",
            telegram_chat_id="555",
            telegram_message_id="777",
        )

        self.assertEqual(lead.bot, self.bot)
        self.assertEqual(lead.icp, self.icp)
        self.assertEqual(lead.prompt_template, self.prompt_template)
        self.assertEqual(lead.decision, LeadDecision.QUALIFIED)
        self.assertEqual(lead.sheet_status, SheetStatus.SUCCESS)
        self.assertEqual(lead.owner, self.user)
        append_lead_log.assert_called_once_with(lead)


class TelegramWebhookTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="telegram-owner", password="StrongPass123!")
        self.icp = ICP.objects.create(
            owner=self.user,
            name="Enterprise",
            description="Enterprise ICP",
            allowed_regions=["LATAM"],
            allowed_industries=["Software"],
            required_interests=["qualification"],
            exclusion_rules=[],
        )
        PromptTemplate.objects.create(
            owner=self.user,
            icp=self.icp,
            name="Telegram prompt",
            system_prompt="Classify the incoming lead and return JSON.",
            output_schema={"decision": "string"},
            version="v1",
            is_active=True,
        )
        provider_config = LLMProviderConfig.objects.create(
            owner=self.user,
            provider=LLMProviderChoices.MOCK,
            name="Mock Provider",
            model="mock-telegram",
            is_active=True,
        )
        self.bot = Bot.objects.create(
            owner=self.user,
            name="Webhook Bot",
            telegram_username="webhook_bot",
            telegram_token="token-123",
            webhook_secret="telegram-secret",
            default_icp=self.icp,
            llm_provider_config=provider_config,
            is_active=True,
        )

    @patch("apps.telegram.views.TelegramBotMessenger.send_message", return_value=True)
    def test_telegram_webhook_creates_lead(self, send_message):
        payload = {
            "update_id": 1001,
            "message": {
                "message_id": 321,
                "text": "We need a demo for our team of 12 employees.",
                "chat": {"id": 999},
            },
        }

        response = self.client.post(
            "/api/telegram/webhook/",
            data=payload,
            format="json",
            HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN="telegram-secret",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "processed")
        self.assertTrue(response.data["telegram_processing_sent"])
        self.assertTrue(response.data["telegram_response_sent"])
        self.assertEqual(Lead.objects.count(), 1)
        self.assertEqual(Lead.objects.first().bot, self.bot)
        self.assertEqual(send_message.call_count, 2)

    @patch("apps.telegram.views.TelegramBotMessenger.send_message", return_value=True)
    def test_telegram_webhook_start_sends_welcome_without_creating_lead(self, send_message):
        payload = {
            "update_id": 1003,
            "message": {
                "message_id": 987,
                "text": "/start",
                "chat": {"id": 999},
            },
        }

        response = self.client.post(
            "/api/telegram/webhook/",
            data=payload,
            format="json",
            HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN="telegram-secret",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "help_sent")
        self.assertTrue(response.data["telegram_response_sent"])
        self.assertEqual(Lead.objects.count(), 0)
        send_message.assert_called_once()

    def test_telegram_webhook_requires_secret(self):
        payload = {
            "update_id": 1002,
            "message": {
                "message_id": 654,
                "text": "Lead without secret header.",
                "chat": {"id": 1000},
            },
        }

        response = self.client.post("/api/telegram/webhook/", data=payload, format="json")

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["detail"], "Invalid or missing webhook secret.")


class AdminAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            username="admin",
            password="StrongPass123!",
            is_staff=True,
            is_superuser=True,
        )

    def test_admin_login_returns_tokens(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "admin", "password": "StrongPass123!"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["username"], "admin")

    def test_admin_profile_requires_authentication(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 401)


class UserIsolationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_a = User.objects.create_user(username="alice", password="StrongPass123!")
        self.user_b = User.objects.create_user(username="bob", password="StrongPass123!")

        self.icp_a = ICP.objects.create(owner=self.user_a, name="ICP A")
        self.icp_b = ICP.objects.create(owner=self.user_b, name="ICP B")

        self.bot_a = Bot.objects.create(
            owner=self.user_a,
            name="Bot A",
            telegram_username="bot_a",
            telegram_token="token-a",
            default_icp=self.icp_a,
        )
        Bot.objects.create(
            owner=self.user_b,
            name="Bot B",
            telegram_username="bot_b",
            telegram_token="token-b",
            default_icp=self.icp_b,
        )

    def test_regular_user_can_login(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "alice", "password": "StrongPass123!"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["user"]["is_staff"])

    def test_user_only_sees_owned_bots(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get("/api/bots/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.bot_a.id)

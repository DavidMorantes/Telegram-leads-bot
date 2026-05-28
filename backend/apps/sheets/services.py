import json
from pathlib import Path
from urllib.parse import quote

from django.conf import settings
from google.auth.transport.requests import AuthorizedSession
from google.oauth2 import service_account

from apps.leads.models import SheetStatus


class GoogleSheetsService:
    """Append qualified lead records to a configured Google Sheet."""

    SCOPES = ("https://www.googleapis.com/auth/spreadsheets",)

    @staticmethod
    def _read_credentials_value(raw_value: str | None = None, file_path: str | None = None) -> str:
        """
        Resolve credentials from either inline JSON or a mounted file path.

        Backward compatibility:
        - If raw_value already contains JSON, return it as-is.
        - If raw_value points to an existing file, read that file.
        - If file_path is provided and exists, read that file.
        """
        if file_path:
            candidate = Path(file_path)
            if candidate.exists() and candidate.is_file():
                return candidate.read_text(encoding="utf-8")

        if raw_value:
            candidate = Path(raw_value)
            if candidate.exists() and candidate.is_file():
                return candidate.read_text(encoding="utf-8")
            return raw_value

        return ""

    def append_lead_log(self, lead):
        """Append a lead row and return a normalized sheet status payload."""
        sheet_config = getattr(getattr(lead, "bot", None), "sheet_config", None)
        if not sheet_config or not sheet_config.is_active:
            return {"lead_id": getattr(lead, "id", None), "status": SheetStatus.SKIPPED, "reason": "No active sheet config."}

        credentials_payload = self._read_credentials_value(
            raw_value=getattr(sheet_config, "credentials_json", ""),
            file_path=settings.GOOGLE_SHEETS_CREDENTIALS_FILE,
        ) or self._read_credentials_value(
            raw_value=settings.GOOGLE_SHEETS_CREDENTIALS_JSON,
            file_path=settings.GOOGLE_SHEETS_CREDENTIALS_FILE,
        )
        if not credentials_payload:
            return {
                "lead_id": getattr(lead, "id", None),
                "status": SheetStatus.FAILED,
                "reason": "Missing Google Sheets credentials payload or file.",
            }

        try:
            credentials_info = json.loads(credentials_payload)
            credentials = service_account.Credentials.from_service_account_info(
                credentials_info,
                scopes=self.SCOPES,
            )
            session = AuthorizedSession(credentials)
            range_name = quote(f"{sheet_config.worksheet_name}!A:Q", safe="")
            url = (
                "https://sheets.googleapis.com/v4/spreadsheets/"
                f"{sheet_config.spreadsheet_id}/values/{range_name}:append"
            )
            response = session.post(
                url,
                params={"valueInputOption": "USER_ENTERED", "insertDataOption": "INSERT_ROWS"},
                json={"values": [self._build_lead_row(lead)]},
                timeout=20,
            )
            response.raise_for_status()
        except Exception as exc:
            return {
                "lead_id": getattr(lead, "id", None),
                "status": SheetStatus.FAILED,
                "reason": f"Google Sheets append failed: {exc}",
            }

        return {"lead_id": getattr(lead, "id", None), "status": SheetStatus.SUCCESS, "reason": "Lead appended."}

    @staticmethod
    def build_sheet_url(spreadsheet_id: str | None) -> str:
        if not spreadsheet_id:
            return ""
        return f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit"

    @staticmethod
    def _build_lead_row(lead) -> list:
        return [
            lead.id,
            lead.created_at.isoformat() if lead.created_at else "",
            getattr(lead.bot, "name", lead.bot_id),
            lead.telegram_chat_id,
            lead.telegram_message_id,
            lead.decision,
            str(lead.confidence) if lead.confidence is not None else "",
            lead.reason,
            lead.raw_text,
            getattr(lead.icp, "name", lead.icp_id or ""),
            getattr(lead.prompt_template, "name", lead.prompt_template_id or ""),
            lead.llm_provider,
            lead.llm_model,
            lead.input_tokens,
            lead.output_tokens,
            str(lead.estimated_cost) if lead.estimated_cost is not None else "",
            json.dumps(lead.extracted_data or {}, ensure_ascii=False),
        ]

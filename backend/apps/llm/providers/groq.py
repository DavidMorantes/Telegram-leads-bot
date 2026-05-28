import json

import requests
from django.conf import settings
from requests import RequestException, Timeout

from apps.core.exceptions import IntegrationConfigurationError
from apps.leads.models import LeadDecision
from apps.llm.providers.base import BaseLLMProvider, LeadQualificationResult


class GroqLLMProvider(BaseLLMProvider):
    def analyze_lead(self, prompt: str, context: dict | None = None) -> LeadQualificationResult:
        context = context or {}
        api_key = getattr(self.config, "api_key", "") or settings.GROQ_API_KEY
        if not api_key:
            raise IntegrationConfigurationError("Groq API key is not configured.")

        model = getattr(self.config, "model", "llama-3.1-8b-instant")
        raw_text = (context.get("raw_text") or "").strip()
        if not raw_text:
            raise IntegrationConfigurationError(
                "Groq received empty lead text. Cannot analyze without content."
            )

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": raw_text},
            ],
            "temperature": float(getattr(self.config, "temperature", 0.2)),
            "max_tokens": getattr(self.config, "max_tokens", 512),
        }

        try:
            supported_models = (
                "llama", "mixtral", "gemma", "qwen", "deepseek", "whisper"
            )
            if any(m in model.lower() for m in supported_models):
                payload["response_format"] = {"type": "json_object"}
        except Exception:
            pass

        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        base_url = (getattr(self.config, "base_url", "") or settings.GROQ_BASE_URL).rstrip("/")

        try:
            response = requests.post(
                f"{base_url}/chat/completions",
                json=payload,
                headers=headers,
                timeout=getattr(self.config, "timeout_seconds", 30),
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
        except Timeout as exc:
            raise IntegrationConfigurationError("Groq request timed out.") from exc
        except json.JSONDecodeError as exc:
            raise IntegrationConfigurationError("Groq returned invalid JSON content.") from exc
        except RequestException as exc:
            detail = ""
            if exc.response is not None:
                try:
                    detail = exc.response.text[:1000]
                except Exception:
                    pass
            msg = f"Groq request failed: {exc}"
            if detail:
                msg += f" | Response: {detail}"
            raise IntegrationConfigurationError(msg) from exc

        usage = data.get("usage", {})

        decision = parsed.get("decision", LeadDecision.UNCERTAIN)
        if decision not in LeadDecision.values:
            raise IntegrationConfigurationError("Groq returned an unsupported decision.")

        confidence = parsed.get("confidence")
        return LeadQualificationResult(
            decision=decision,
            reason=parsed.get("reason", ""),
            confidence=float(confidence) if confidence is not None else None,
            provider="groq",
            model=model,
            extracted_data=parsed.get("extracted_data", {}),
            input_tokens=usage.get("prompt_tokens", 0),
            output_tokens=usage.get("completion_tokens", 0),
            estimated_cost=0.0,
        )

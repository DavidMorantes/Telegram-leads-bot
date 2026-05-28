from apps.leads.models import LeadDecision
from apps.llm.providers.base import BaseLLMProvider, LeadQualificationResult


class MockLLMProvider(BaseLLMProvider):
    def analyze_lead(self, prompt: str, context: dict | None = None) -> LeadQualificationResult:
        context = context or {}
        raw_text = (context.get("raw_text") or "").lower()

        if any(keyword in raw_text for keyword in ("looking for demo", "budget", "team", "employees")):
            decision = LeadDecision.QUALIFIED
            confidence = 0.86
            reason = "Mock provider detected signals consistent with an interested business lead."
        elif any(keyword in raw_text for keyword in ("student", "job", "spam", "personal use")):
            decision = LeadDecision.NOT_QUALIFIED
            confidence = 0.82
            reason = "Mock provider detected non-ICP intent."
        else:
            decision = LeadDecision.UNCERTAIN
            confidence = 0.55
            reason = "Mock provider could not confidently determine fit."

        return LeadQualificationResult(
            decision=decision,
            reason=reason,
            confidence=confidence,
            provider="mock",
            model=getattr(self.config, "model", "mock-model"),
            extracted_data={"summary": raw_text[:120], **context},
            input_tokens=0,
            output_tokens=0,
            estimated_cost=0.0,
        )

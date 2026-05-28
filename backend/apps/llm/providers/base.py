from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass(slots=True)
class LeadQualificationResult:
    decision: str
    reason: str
    confidence: float | None
    extracted_data: dict = field(default_factory=dict)
    provider: str = ""
    model: str = ""
    input_tokens: int = 0
    output_tokens: int = 0
    estimated_cost: float = 0.0


class BaseLLMProvider(ABC):
    """Common contract for all LLM providers used by the qualification pipeline."""

    def __init__(self, config=None):
        self.config = config

    @abstractmethod
    def analyze_lead(self, prompt: str, context: dict | None = None) -> LeadQualificationResult:
        """Return a normalized lead qualification response."""

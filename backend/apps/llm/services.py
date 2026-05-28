from apps.core.exceptions import IntegrationConfigurationError
from apps.llm.models import LLMProviderChoices
from apps.llm.providers.groq import GroqLLMProvider
from apps.llm.providers.mock import MockLLMProvider


PROVIDER_MAP = {
    LLMProviderChoices.GROQ: GroqLLMProvider,
    LLMProviderChoices.MOCK: MockLLMProvider,
}


def get_llm_provider(config):
    """Resolve the proper provider implementation for the active configuration."""

    provider_class = PROVIDER_MAP.get(config.provider)
    if not provider_class:
        raise IntegrationConfigurationError(f"Provider '{config.provider}' is not implemented yet.")
    return provider_class(config=config)

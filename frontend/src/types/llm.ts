export type LLMProviderConfig = {
  id: number;
  provider: string;
  name: string;
  model: string;
  base_url: string | null;
  api_key?: string;
  api_key_masked?: string;
  temperature: string | null;
  max_tokens: number | null;
  timeout_seconds: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LLMProviderPayload = {
  provider: string;
  name: string;
  model: string;
  base_url: string | null;
  api_key?: string;
  temperature: string | null;
  max_tokens: number | null;
  timeout_seconds: number | null;
  is_active: boolean;
};

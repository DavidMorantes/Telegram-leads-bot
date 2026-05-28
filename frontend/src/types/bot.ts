export type Bot = {
  id: number;
  name: string;
  telegram_username: string;
  telegram_token?: string;
  telegram_token_masked?: string;
  webhook_secret?: string;
  is_active: boolean;
  default_icp: number | null;
  llm_provider_config: number | null;
  sheet_config: number | null;
  created_at: string;
  updated_at: string;
};

export type BotPayload = {
  name: string;
  telegram_username: string;
  telegram_token?: string;
  webhook_secret?: string;
  is_active: boolean;
  default_icp: number | null;
  llm_provider_config: number | null;
  sheet_config: number | null;
};

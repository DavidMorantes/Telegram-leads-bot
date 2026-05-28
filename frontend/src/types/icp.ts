export type PromptTemplate = {
  id: number;
  icp: number;
  name: string;
  system_prompt: string;
  output_schema: Record<string, unknown>;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PromptTemplatePayload = Omit<PromptTemplate, "id" | "created_at" | "updated_at">;

export type Icp = {
  id: number;
  name: string;
  description: string;
  min_employees: number | null;
  allowed_regions: string[];
  allowed_industries: string[];
  required_interests: string[];
  exclusion_rules: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  prompt_templates: PromptTemplate[];
};

export type IcpPayload = {
  name: string;
  description: string;
  min_employees: number | null;
  allowed_regions: string[];
  allowed_industries: string[];
  required_interests: string[];
  exclusion_rules: string[];
  is_active: boolean;
};

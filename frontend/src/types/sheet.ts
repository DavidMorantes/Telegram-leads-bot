export type SheetConfig = {
  id: number;
  name: string;
  spreadsheet_id: string;
  worksheet_name: string;
  credentials_json?: string;
  credentials_json_masked?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SheetConfigPayload = {
  name: string;
  spreadsheet_id: string;
  worksheet_name: string;
  credentials_json?: string;
  is_active: boolean;
};

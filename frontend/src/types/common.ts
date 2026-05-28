export type ApiListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Decision = "qualified" | "not_qualified" | "uncertain" | "failed";

export type SheetStatus = "pending" | "success" | "failed" | "skipped";

import { apiClient } from "./client";
import type { SheetConfig, SheetConfigPayload } from "../types/sheet";
import type { ApiListResponse } from "../types/common";

const PATH = "/sheets/configs/";

export const sheetsApi = {
  list: () => apiClient.get<ApiListResponse<SheetConfig>>(PATH).then((r) => r.data),
  get: (id: number) => apiClient.get<SheetConfig>(`${PATH}${id}/`).then((r) => r.data),
  create: (payload: SheetConfigPayload) =>
    apiClient.post<SheetConfig>(PATH, payload).then((r) => r.data),
  update: (id: number, payload: SheetConfigPayload) =>
    apiClient.put<SheetConfig>(`${PATH}${id}/`, payload).then((r) => r.data),
  patch: (id: number, payload: Partial<SheetConfigPayload>) =>
    apiClient.patch<SheetConfig>(`${PATH}${id}/`, payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`${PATH}${id}/`).then((r) => r.data),
};

import { apiClient } from "./client";
import type { Lead } from "../types/lead";
import type { ApiListResponse } from "../types/common";

const PATH = "/leads/";

export const leadsApi = {
  list: () => apiClient.get<ApiListResponse<Lead>>(PATH).then((r) => r.data),
  get: (id: number) => apiClient.get<Lead>(`${PATH}${id}/`).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`${PATH}${id}/`).then((r) => r.data),
};

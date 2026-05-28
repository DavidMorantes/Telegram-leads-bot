import { apiClient } from "./client";
import type { Bot, BotPayload } from "../types/bot";
import type { ApiListResponse } from "../types/common";

const PATH = "/bots/";

export const botsApi = {
  list: () => apiClient.get<ApiListResponse<Bot>>(PATH).then((r) => r.data),
  get: (id: number) => apiClient.get<Bot>(`${PATH}${id}/`).then((r) => r.data),
  create: (payload: BotPayload) => apiClient.post<Bot>(PATH, payload).then((r) => r.data),
  update: (id: number, payload: BotPayload) =>
    apiClient.put<Bot>(`${PATH}${id}/`, payload).then((r) => r.data),
  patch: (id: number, payload: Partial<BotPayload>) =>
    apiClient.patch<Bot>(`${PATH}${id}/`, payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`${PATH}${id}/`).then((r) => r.data),
};

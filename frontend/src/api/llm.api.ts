import { apiClient } from "./client";
import type { LLMProviderConfig, LLMProviderPayload } from "../types/llm";
import type { ApiListResponse } from "../types/common";

const PATH = "/llm/provider-configs/";

export const llmApi = {
  list: () => apiClient.get<ApiListResponse<LLMProviderConfig>>(PATH).then((r) => r.data),
  get: (id: number) => apiClient.get<LLMProviderConfig>(`${PATH}${id}/`).then((r) => r.data),
  create: (payload: LLMProviderPayload) =>
    apiClient.post<LLMProviderConfig>(PATH, payload).then((r) => r.data),
  update: (id: number, payload: LLMProviderPayload) =>
    apiClient.put<LLMProviderConfig>(`${PATH}${id}/`, payload).then((r) => r.data),
  patch: (id: number, payload: Partial<LLMProviderPayload>) =>
    apiClient.patch<LLMProviderConfig>(`${PATH}${id}/`, payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`${PATH}${id}/`).then((r) => r.data),
};

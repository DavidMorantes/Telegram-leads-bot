import { apiClient } from "./client";
import type { Icp, IcpPayload, PromptTemplate, PromptTemplatePayload } from "../types/icp";
import type { ApiListResponse } from "../types/common";

const PATH = "/icps/";
const PROMPT_PATH = "/prompt-templates/";

export const icpsApi = {
  list: () => apiClient.get<ApiListResponse<Icp>>(PATH).then((r) => r.data),
  get: (id: number) => apiClient.get<Icp>(`${PATH}${id}/`).then((r) => r.data),
  create: (payload: IcpPayload) => apiClient.post<Icp>(PATH, payload).then((r) => r.data),
  update: (id: number, payload: IcpPayload) =>
    apiClient.put<Icp>(`${PATH}${id}/`, payload).then((r) => r.data),
  patch: (id: number, payload: Partial<IcpPayload>) =>
    apiClient.patch<Icp>(`${PATH}${id}/`, payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`${PATH}${id}/`).then((r) => r.data),
};

export const promptsApi = {
  list: () => apiClient.get<ApiListResponse<PromptTemplate>>(PROMPT_PATH).then((r) => r.data),
  get: (id: number) => apiClient.get<PromptTemplate>(`${PROMPT_PATH}${id}/`).then((r) => r.data),
  create: (payload: PromptTemplatePayload) =>
    apiClient.post<PromptTemplate>(PROMPT_PATH, payload).then((r) => r.data),
  update: (id: number, payload: PromptTemplatePayload) =>
    apiClient.put<PromptTemplate>(`${PROMPT_PATH}${id}/`, payload).then((r) => r.data),
  patch: (id: number, payload: Partial<PromptTemplatePayload>) =>
    apiClient.patch<PromptTemplate>(`${PROMPT_PATH}${id}/`, payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`${PROMPT_PATH}${id}/`).then((r) => r.data),
};

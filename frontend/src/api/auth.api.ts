import { apiClient } from "./client";
import type { AuthUser, LoginResponse } from "../types/auth";

export const authApi = {
  login: (payload: { username: string; password: string }) =>
    apiClient.post<LoginResponse>("/auth/login/", payload).then((r) => r.data),
  refresh: (refresh: string) =>
    apiClient.post<{ access: string; refresh?: string }>("/auth/refresh/", { refresh }).then((r) => r.data),
  me: () => apiClient.get<AuthUser>("/auth/me/").then((r) => r.data),
};

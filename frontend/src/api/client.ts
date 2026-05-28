import axios, { AxiosError, type AxiosResponse } from "axios";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../auth/token-storage";
import { env } from "../config/env";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refresh = getRefreshToken();
      if (refresh) {
        originalRequest._retry = true;
        refreshPromise ??= apiClient
          .post<{ access: string; refresh?: string }>("/auth/refresh/", { refresh })
          .then((r) => {
            const nextAccess = r.data.access;
            const nextRefresh = r.data.refresh ?? refresh;
            setTokens(nextAccess, nextRefresh);
            return nextAccess;
          })
          .catch(() => {
            clearTokens();
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });

        const nextAccess = await refreshPromise;
        if (nextAccess) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${nextAccess}`;
          return apiClient(originalRequest);
        }
      } else {
        clearTokens();
      }
    }

    const message =
      (error.response?.data as { detail?: string })?.detail ||
      error.message ||
      "Error desconocido en la peticion";

    console.error("[API Error]", message);
    return Promise.reject(new Error(message));
  },
);

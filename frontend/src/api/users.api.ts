import { apiClient } from "./client";
import type { AuthUser, UserCreatePayload } from "../types/auth";
import type { ApiListResponse } from "../types/common";

const PATH = "/auth/users/";

export const usersApi = {
  list: () => apiClient.get<ApiListResponse<AuthUser>>(PATH).then((r) => r.data),
  create: (payload: UserCreatePayload) => apiClient.post<AuthUser>(PATH, payload).then((r) => r.data),
};

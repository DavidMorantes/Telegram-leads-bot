import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "../api/auth.api";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./token-storage";
import type { AuthUser } from "../types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const access = getAccessToken();
      const refresh = getRefreshToken();

      if (!access || !refresh) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authApi.me();
        setUser(profile);
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login: async (username: string, password: string) => {
        const data = await authApi.login({ username, password });
        setTokens(data.access, data.refresh);
        setUser(data.user);
      },
      logout: () => {
        clearTokens();
        setUser(null);
      },
      refreshProfile: async () => {
        const profile = await authApi.me();
        setUser(profile);
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

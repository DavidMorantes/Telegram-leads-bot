const ACCESS_KEY = "tlq_access_token";
const REFRESH_KEY = "tlq_refresh_token";

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string) {
  sessionStorage.setItem(ACCESS_KEY, access);
  sessionStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

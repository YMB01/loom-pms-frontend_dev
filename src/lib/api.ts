import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

/** Cookie name for the Laravel Sanctum Bearer token (set after login). */
export const AUTH_TOKEN_COOKIE = "loom_pms_token";

/**
 * API base URL:
 * - Production / preview: `NEXT_PUBLIC_API_URL` (full URL to Laravel, e.g. https://api.example.com/api).
 * - Local dev (no env): same-origin `/api-proxy` (Next.js rewrites to Laravel — see `next.config.mjs`).
 * - Local override: set `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api` to call Laravel directly.
 */
export function getApiBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  // Dev: same-origin proxy (see next.config rewrites) — avoids direct :8000 / IPv6 issues
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    return `${window.location.origin}/api-proxy`;
  }
  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:8000/api";
  }
  throw new Error(
    "NEXT_PUBLIC_API_URL is required in production. Set it in Vercel → Environment Variables."
  );
}

export const api = axios.create({
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = getApiBaseUrl();
  const token = Cookies.get(AUTH_TOKEN_COOKIE);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = String(error.config?.url ?? "");
    const isLoginAttempt = url.includes("/auth/login");
    const trialExpired =
      status === 403 &&
      (error.response?.data as { data?: { code?: string } })?.data?.code ===
        "trial_expired";
    if (
      trialExpired &&
      typeof window !== "undefined" &&
      !url.includes("/billing/") &&
      !window.location.pathname.startsWith("/upgrade")
    ) {
      window.location.assign("/upgrade");
    }
    if (status === 401 && typeof window !== "undefined" && !isLoginAttempt) {
      Cookies.remove(AUTH_TOKEN_COOKIE, { path: "/" });
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

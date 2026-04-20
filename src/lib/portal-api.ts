import axios, { type InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "@/lib/api";

/** localStorage key for Sanctum token (tenant model). */
export const PORTAL_TOKEN_KEY = "loom_portal_token";

export function getPortalToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PORTAL_TOKEN_KEY);
}

export function setPortalToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(PORTAL_TOKEN_KEY, token);
  else localStorage.removeItem(PORTAL_TOKEN_KEY);
}

export const portalApi = axios.create({
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

portalApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = getApiBaseUrl();
  const t = getPortalToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

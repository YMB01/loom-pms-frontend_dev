import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "@/lib/api";

/** Separate from customer PMS — never send the regular `loom_pms_token` to super-admin routes. */
export const SUPER_ADMIN_TOKEN_COOKIE = "loom_pms_super_admin_token";

export const superAdminApi = axios.create({
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

superAdminApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = getApiBaseUrl();
  const token = Cookies.get(SUPER_ADMIN_TOKEN_COOKIE);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

superAdminApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = String(error.config?.url ?? "");
    const isLoginAttempt = url.includes("/super-admin/login");
    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !isLoginAttempt
    ) {
      Cookies.remove(SUPER_ADMIN_TOKEN_COOKIE, { path: "/" });
      if (!window.location.pathname.startsWith("/super-admin/login")) {
        window.location.assign("/super-admin/login");
      }
    }
    return Promise.reject(error);
  }
);

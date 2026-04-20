"use client";

import { portalApi, setPortalToken, getPortalToken } from "@/lib/portal-api";
import type { ApiEnvelope } from "@/types/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";

type PortalAuthValue = {
  token: string | null;
  loading: boolean;
  logout: () => void;
  setToken: (t: string | null) => void;
};

const PortalAuthContext = createContext<PortalAuthValue | null>(null);

const PUBLIC_PATHS = ["/portal/login"];

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTokenState(getPortalToken());
    setLoading(false);
  }, []);

  const setToken = useCallback((t: string | null) => {
    setPortalToken(t);
    setTokenState(t);
  }, []);

  const logout = useCallback(() => {
    setPortalToken(null);
    setTokenState(null);
    router.replace("/portal/login");
  }, [router]);

  useEffect(() => {
    if (loading) return;
    if (!pathname?.startsWith("/portal")) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (!token && !isPublic) {
      router.replace("/portal/login");
    }
    if (token && pathname === "/portal/login") {
      router.replace("/portal/home");
    }
  }, [loading, token, pathname, router]);

  const value = useMemo(
    () => ({
      token,
      loading,
      logout,
      setToken,
    }),
    [token, loading, logout, setToken],
  );

  return (
    <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>
  );
}

export function usePortalAuth(): PortalAuthValue {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error("usePortalAuth must be used within PortalAuthProvider");
  return ctx;
}

export async function portalRequestOtp(phone: string): Promise<ApiEnvelope<{ sent: boolean; expires_in_minutes: number; debug_code?: string }>> {
  const { data } = await portalApi.post("/portal/request-otp", { phone });
  return data;
}

export async function portalVerifyOtp(
  phone: string,
  code: string,
): Promise<ApiEnvelope<{ token: string; token_type: string; tenant_id: number }>> {
  const { data } = await portalApi.post("/portal/verify-otp", { phone, code });
  return data;
}

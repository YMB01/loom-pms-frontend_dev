"use client";

import { api } from "@/lib/api";
import type { BrandingResponse } from "@/types/settings";
import type { ApiEnvelope } from "@/types/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/contexts/auth-context";

type BrandingContextValue = {
  branding: BrandingResponse | null;
  loading: boolean;
  refresh: () => Promise<void>;
  displayName: string;
  primaryColor: string;
};

const BrandingContext = createContext<BrandingContextValue | null>(null);

const DEFAULT_PRIMARY = "#2563eb";

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [branding, setBranding] = useState<BrandingResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setBranding(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get<ApiEnvelope<BrandingResponse>>("/settings/branding");
      if (data.success && data.data) {
        setBranding(data.data);
      } else {
        setBranding(null);
      }
    } catch {
      setBranding(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh, user?.id, isAuthenticated]);

  const primaryColor = branding?.primary_color?.trim() || DEFAULT_PRIMARY;

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--brand-primary", primaryColor);
    return () => {
      document.documentElement.style.removeProperty("--brand-primary");
    };
  }, [primaryColor]);

  const displayName = branding?.brand_name?.trim() || branding?.company_name || "Loom PMS";

  const value = useMemo(
    () => ({
      branding,
      loading,
      refresh,
      displayName,
      primaryColor,
    }),
    [branding, loading, refresh, displayName, primaryColor],
  );

  return (
    <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
  );
}

export function useBranding(): BrandingContextValue {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    throw new Error("useBranding must be used within BrandingProvider");
  }
  return ctx;
}

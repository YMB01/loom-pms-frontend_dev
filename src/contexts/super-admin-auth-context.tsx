"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  superAdminApi,
  SUPER_ADMIN_TOKEN_COOKIE,
} from "@/lib/super-admin-api";
import type { SuperAdminMeApiResponse } from "@/types/super-admin";

type SuperAdminUser = {
  email: string | null;
};

type SuperAdminAuthContextValue = {
  user: SuperAdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refresh: (accessToken?: string) => Promise<void>;
};

const SuperAdminAuthContext = createContext<SuperAdminAuthContextValue | null>(
  null
);

export function SuperAdminAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<SuperAdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (accessToken?: string) => {
    const token = accessToken ?? Cookies.get(SUPER_ADMIN_TOKEN_COOKIE);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await superAdminApi.get<SuperAdminMeApiResponse>(
        "/super-admin/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data.success && data.data?.role === "super_admin") {
        setUser({ email: data.data.email ?? null });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await superAdminApi.post("/super-admin/logout");
    } catch {
      /* ignore */
    }
    Cookies.remove(SUPER_ADMIN_TOKEN_COOKIE, { path: "/" });
    setUser(null);
    router.push("/super-admin/login");
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      logout,
      refresh,
    }),
    [user, loading, logout, refresh]
  );

  return (
    <SuperAdminAuthContext.Provider value={value}>
      {children}
    </SuperAdminAuthContext.Provider>
  );
}

export function useSuperAdminAuth(): SuperAdminAuthContextValue {
  const ctx = useContext(SuperAdminAuthContext);
  if (!ctx) {
    throw new Error(
      "useSuperAdminAuth must be used within SuperAdminAuthProvider"
    );
  }
  return ctx;
}

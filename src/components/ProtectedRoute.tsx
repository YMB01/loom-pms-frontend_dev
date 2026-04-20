"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || !user?.company) {
      return;
    }
    const c = user.company;
    const onUpgradePath = pathname.startsWith("/upgrade");
    if (onUpgradePath) {
      return;
    }
    if (c.requires_upgrade) {
      router.replace("/upgrade");
      return;
    }
    if (c.status === "suspended") {
      router.replace("/upgrade");
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f5f6fa]">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-[#2563eb] border-t-transparent"
          aria-hidden
        />
        <p className="text-sm font-medium text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

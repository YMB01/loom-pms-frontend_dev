"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSuperAdminAuth } from "@/contexts/super-admin-auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function SuperAdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useSuperAdminAuth();
  const tNav = useTranslations("superAdmin");
  const tp = useTranslations("superAdminPanel");

  const nav = useMemo(
    () =>
      [
        { href: "/super-admin/dashboard", msg: "dashboard" as const },
        { href: "/super-admin/billing", msg: "billing" as const },
        { href: "/super-admin/companies", msg: "companies" as const },
        { href: "/super-admin/marketplace", msg: "marketplace" as const },
        { href: "/super-admin/messages", msg: "messages" as const },
        { href: "/super-admin/backups", msg: "backups" as const },
      ] as const,
    [],
  );

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/super-admin/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-loom-page">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-loom-border-2 border-t-loom-blue-600"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-loom-bg font-sans text-loom-text-900">
      <aside className="flex w-56 shrink-0 flex-col border-r border-loom-border bg-loom-sidebar">
        <div className="flex items-start justify-between gap-2 border-b border-loom-border px-4 py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-loom-text-400">
              {tp("systemLabel")}
            </p>
            <p className="mt-1 text-sm font-semibold text-loom-text-900">{tp("productTitle")}</p>
            <p className="mt-0.5 truncate text-xs text-loom-text-500" title={user.email ?? ""}>
              {user.email ?? "—"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-loom-blue-600 text-white"
                    : "text-loom-text-500 hover:bg-loom-hover hover:text-loom-text-900"
                }`}
              >
                {tNav(item.msg)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-loom-border p-2">
          <button
            type="button"
            onClick={() => logout()}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-loom-text-500 transition-colors hover:bg-loom-hover hover:text-loom-text-900"
          >
            {tp("signOut")}
          </button>
        </div>
      </aside>
      <main className="min-h-screen flex-1 overflow-auto bg-loom-bg p-6 md:p-8">
        <div className="animate-loom-page-in">{children}</div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function isActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const Icons = {
  dashboard: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  props: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  tenants: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  ),
  invoices: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  more: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
};

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const t = useTranslations("nav");
  const tm = useTranslations("mobileNav");

  const primary = useMemo(
    () =>
      [
        { href: "/dashboard", label: t("dashboard"), icon: Icons.dashboard },
        { href: "/dashboard/properties", label: t("properties"), icon: Icons.props },
        { href: "/dashboard/tenants", label: t("tenants"), icon: Icons.tenants },
        { href: "/dashboard/invoices", label: t("invoices"), icon: Icons.invoices },
      ] as const,
    [t],
  );

  const moreLinks = useMemo(
    () => [
      { href: "/dashboard/units", label: t("units") },
      { href: "/dashboard/leases", label: t("leases") },
      { href: "/dashboard/payments", label: t("payments") },
      { href: "/dashboard/maintenance", label: t("maintenance") },
      { href: "/dashboard/sms", label: t("smsCenter") },
      { href: "/dashboard/reports", label: t("reports") },
      { href: "/dashboard/marketplace", label: t("marketplace") },
      { href: "/portal", label: t("tenantPortal") },
      { href: "/dashboard/settings", label: t("settings") },
    ],
    [t],
  );

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-[120] flex border-t border-loom-border bg-loom-surface/95 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] backdrop-blur-md md:hidden"
        aria-label={tm("primary")}
      >
        {primary.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-semibold leading-tight ${
                active ? "text-[color:var(--brand-primary,#2563eb)]" : "text-loom-text-500"
              }`}
            >
              <span
                className={
                  active ? "text-[color:var(--brand-primary,#2563eb)]" : "text-loom-text-400"
                }
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-semibold leading-tight text-loom-text-500"
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
        >
          <span className="text-loom-text-400">{Icons.more}</span>
          {tm("more")}
        </button>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-[130] md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label={tm("closeMenu")}
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl border border-loom-border bg-loom-surface p-4 shadow-loom-xl"
            role="dialog"
            aria-label={tm("moreNav")}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-loom-text-900">{tm("more")}</span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-loom-border text-lg text-loom-text-500"
                aria-label={tm("close")}
              >
                ✕
              </button>
            </div>
            <ul className="space-y-1">
              {moreLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex min-h-11 items-center rounded-lg px-3 py-2.5 text-[13px] font-medium ${
                      isActive(l.href, pathname)
                        ? "bg-loom-blue-50 text-loom-blue-600"
                        : "text-loom-text-700 hover:bg-loom-hover"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}

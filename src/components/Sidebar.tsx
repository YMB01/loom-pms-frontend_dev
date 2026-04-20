"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useBranding } from "@/contexts/branding-context";
import { useDashboardShell } from "@/contexts/dashboard-shell-context";

function isNavActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  if (href === "/portal") {
    return pathname === "/portal" || pathname.startsWith("/portal/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) {
    return `${p[0]![0]}${p[p.length - 1]![0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "??";
}

type NavItem = {
  href: string;
  label: string;
  badge?: { text: string; variant: "red" | "amber" | "gradient" };
  icon: ReactNode;
};

function useSidebarNavItems() {
  const t = useTranslations("nav");
  const tSidebar = useTranslations("sidebar");

  return useMemo(() => {
    const overviewItems: NavItem[] = [
  {
    href: "/dashboard",
    label: t("dashboard"),
    icon: (
      <svg
        className="h-[17px] w-[17px] shrink-0 opacity-85"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/dashboard/properties",
    label: t("properties"),
    icon: (
      <svg
        className="h-[17px] w-[17px] shrink-0 opacity-85"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/dashboard/units",
    label: t("units"),
    icon: (
      <svg
        className="h-[17px] w-[17px] shrink-0 opacity-85"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      </svg>
    ),
  },
];

const peopleItems: NavItem[] = [
  {
    href: "/dashboard/tenants",
    label: t("tenants"),
    icon: (
      <svg
        className="h-[17px] w-[17px] shrink-0 opacity-85"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    href: "/dashboard/leases",
    label: t("leases"),
    icon: (
      <svg
        className="h-[17px] w-[17px] shrink-0 opacity-85"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

const financeItems: NavItem[] = [
  {
    href: "/dashboard/invoices",
    label: t("invoices"),
    badge: { text: "3", variant: "red" },
    icon: (
      <svg
        className="h-[17px] w-[17px] shrink-0 opacity-85"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    href: "/dashboard/payments",
    label: t("payments"),
    icon: (
      <svg
        className="h-[17px] w-[17px] shrink-0 opacity-85"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
];

const operationsItems: NavItem[] = [
  {
    href: "/dashboard/maintenance",
    label: t("maintenance"),
    badge: { text: "5", variant: "amber" },
    icon: (
      <svg
        className="h-[17px] w-[17px] shrink-0 opacity-85"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/sms",
    label: t("smsCenter"),
    icon: (
      <svg
        className="h-[17px] w-[17px] shrink-0 opacity-85"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/reports",
    label: t("reports"),
    icon: (
      <svg
        className="h-[17px] w-[17px] shrink-0 opacity-85"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

const systemItems: NavItem[] = [
  {
    href: "/dashboard/marketplace",
    label: t("marketplace"),
    badge: { text: tSidebar("badgeNew"), variant: "gradient" },
    icon: (
      <svg
        className="h-[17px] w-[17px] shrink-0 opacity-85"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    href: "/portal",
    label: t("tenantPortal"),
    icon: (
      <svg
        className="h-[17px] w-[17px] shrink-0 opacity-85"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/settings",
    label: t("settings"),
    icon: (
      <svg
        className="h-[17px] w-[17px] shrink-0 opacity-85"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

    return {
      overviewItems,
      peopleItems,
      financeItems,
      operationsItems,
      systemItems,
    };
  }, [t, tSidebar]);
}

function NavBadge({
  text,
  variant,
}: {
  text: string;
  variant: "red" | "amber" | "gradient";
}) {
  if (variant === "gradient") {
    return (
      <span className="ml-auto rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] px-1.5 py-px font-mono text-[10px] font-semibold leading-none text-white">
        {text}
      </span>
    );
  }
  if (variant === "amber") {
    return (
      <span className="ml-auto rounded-full bg-loom-amber-500 px-1.5 py-px font-mono text-[10px] font-semibold leading-[1.6] text-white">
        {text}
      </span>
    );
  }
  return (
    <span className="ml-auto rounded-full bg-loom-red-500 px-1.5 py-px font-mono text-[10px] font-semibold leading-[1.6] text-white">
      {text}
    </span>
  );
}

function NavLink({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const active = isNavActive(item.href, pathname);
  return (
    <Link
      href={item.href}
      title={item.label}
      className={`relative mb-px flex w-full items-center gap-[9px] rounded-md border-0 bg-transparent py-2.5 pl-2.5 pr-2.5 text-left text-[13.5px] font-medium transition-all duration-100 md:min-h-[44px] md:justify-center lg:min-h-0 lg:justify-start ${
        active
          ? "bg-loom-blue-50 text-[color:var(--brand-primary,#2563eb)]"
          : "text-loom-text-500 hover:bg-loom-hover hover:text-loom-text-700"
      } `}
    >
      <span
        className={`shrink-0 ${active ? "text-[color:var(--brand-primary,#2563eb)]" : ""}`}
      >
        {item.icon}
      </span>
      <span className="flex-1 md:hidden lg:inline">{item.label}</span>
      {item.badge ? (
        <span className="md:hidden lg:block">
          <NavBadge text={item.badge.text} variant={item.badge.variant} />
        </span>
      ) : null}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { displayName: brandTitle, primaryColor, branding } = useBranding();
  const { mobileSidebarOpen, closeMobileSidebar } = useDashboardShell();
  const { overviewItems, peopleItems, financeItems, operationsItems, systemItems } =
    useSidebarNavItems();
  const ts = useTranslations("navSection");
  const tb = useTranslations("brand");
  const tSidebar = useTranslations("sidebar");
  const tRoles = useTranslations("roles");

  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  const displayName = user?.name ?? tSidebar("userFallback");
  const roleLabel = useMemo(() => {
    if (!user?.role) return tSidebar("member");
    const k = user.role.toLowerCase();
    if (
      ["admin", "property_manager", "tenant", "super_admin", "owner", "manager", "staff"].includes(
        k,
      )
    ) {
      return tRoles(k as "admin");
    }
    return formatRole(user.role);
  }, [user?.role, tRoles, tSidebar]);

  return (
    <>
      <button
        type="button"
        aria-hidden={!mobileSidebarOpen}
        aria-label={tSidebar("closeNav")}
        onClick={closeMobileSidebar}
        className={`fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-200 md:hidden ${
          mobileSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed left-0 top-0 z-[100] flex h-screen w-[252px] flex-col overflow-y-auto border-r border-loom-border bg-loom-sidebar transition-transform duration-200 ease-out [scrollbar-width:thin] md:w-[72px] lg:w-[252px] [&::-webkit-scrollbar]:h-[5px] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-loom-border-2 [&::-webkit-scrollbar-track]:bg-transparent ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
      <div className="flex items-center gap-2.5 border-b border-loom-border px-5 pb-[18px] pt-5 md:justify-center lg:justify-start">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg ${
            branding?.logo ? "bg-white ring-1 ring-loom-border" : ""
          }`}
          style={
            branding?.logo
              ? undefined
              : { backgroundColor: primaryColor || "var(--brand-primary, #2563eb)" }
          }
        >
          {branding?.logo ? (
            <img
              src={branding.logo}
              alt=""
              className="h-full w-full object-contain p-0.5"
            />
          ) : (
            <svg
              className="h-[17px] w-[17px] fill-none stroke-white"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          )}
        </div>
        <div className="min-w-0 md:hidden lg:block">
          <div className="truncate text-[15px] font-bold tracking-[-0.3px] text-loom-text-900">
            {brandTitle}
          </div>
          <div className="mt-px text-[10px] tracking-[0.5px] text-loom-text-400">
            {tb("tagline")}
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col px-3 pb-4 pt-3.5">
        <div className="hidden px-2.5 pb-2 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.8px] text-loom-text-400 lg:block">
          {ts("overview")}
        </div>
        {overviewItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        <div className="mt-2.5 hidden px-2.5 pb-2 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.8px] text-loom-text-400 lg:block">
          {ts("people")}
        </div>
        {peopleItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        <div className="mt-2.5 hidden px-2.5 pb-2 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.8px] text-loom-text-400 lg:block">
          {ts("finance")}
        </div>
        {financeItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        <div className="mt-2.5 hidden px-2.5 pb-2 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.8px] text-loom-text-400 lg:block">
          {ts("operations")}
        </div>
        {operationsItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        <div className="mt-2.5 hidden px-2.5 pb-2 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.8px] text-loom-text-400 lg:block">
          {ts("system")}
        </div>
        {systemItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="flex items-center gap-2.5 border-t border-loom-border px-4 py-3.5 md:justify-center lg:justify-start">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #667eea, #764ba2)",
          }}
        >
          {initials(displayName)}
        </div>
        <div className="min-w-0 flex-1 md:hidden lg:block">
          <div className="truncate text-[13px] font-semibold text-loom-text-900">
            {displayName}
          </div>
          <div className="truncate text-[11px] text-loom-text-400">
            {roleLabel}
          </div>
        </div>
        <button
          type="button"
          title={tSidebar("signOut")}
          onClick={() => void logout()}
          className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1.5 text-loom-text-400 transition-colors hover:bg-loom-red-100 hover:text-loom-red-600 md:min-h-0 md:min-w-0 lg:min-h-[auto]"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
    </>
  );
}

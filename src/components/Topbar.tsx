"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardModals } from "@/contexts/dashboard-modals-context";
import { useDashboardShell } from "@/contexts/dashboard-shell-context";
import { DashboardNotificationBell } from "@/components/DashboardNotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

type RouteDef = { prefix: string; routeKey: keyof MessagesRoutes };

/** Mirrors `routes` in locale JSON — used only for typings of `routeKey`. */
type MessagesRoutes = {
  dashboard: { title: string; crumb: string };
  properties: { title: string; crumb: string };
  units: { title: string; crumb: string };
  tenants: { title: string; crumb: string };
  leases: { title: string; crumb: string };
  invoices: { title: string; crumb: string };
  payments: { title: string; crumb: string };
  maintenance: { title: string; crumb: string };
  sms: { title: string; crumb: string };
  reports: { title: string; crumb: string };
  marketplace: { title: string; crumb: string };
  portal: { title: string; crumb: string };
  settings: { title: string; crumb: string };
};

const ROUTE_DEFS: RouteDef[] = [
  { prefix: "/dashboard/settings", routeKey: "settings" },
  { prefix: "/dashboard/marketplace", routeKey: "marketplace" },
  { prefix: "/dashboard/reports", routeKey: "reports" },
  { prefix: "/dashboard/sms", routeKey: "sms" },
  { prefix: "/dashboard/maintenance", routeKey: "maintenance" },
  { prefix: "/dashboard/payments", routeKey: "payments" },
  { prefix: "/dashboard/invoices", routeKey: "invoices" },
  { prefix: "/dashboard/leases", routeKey: "leases" },
  { prefix: "/dashboard/tenants", routeKey: "tenants" },
  { prefix: "/dashboard/units", routeKey: "units" },
  { prefix: "/dashboard/properties", routeKey: "properties" },
  { prefix: "/dashboard", routeKey: "dashboard" },
];

function getRouteDef(pathname: string): RouteDef {
  const normalized =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;
  for (const r of ROUTE_DEFS) {
    if (r.prefix === "/dashboard") {
      if (normalized === "/dashboard") {
        return r;
      }
      continue;
    }
    if (normalized === r.prefix || normalized.startsWith(`${r.prefix}/`)) {
      return r;
    }
  }
  return ROUTE_DEFS.find((x) => x.prefix === "/dashboard")!;
}

const CURRENCIES: Record<string, { symbol: string; code: string }> = {
  USD: { symbol: "$", code: "USD" },
  EUR: { symbol: "€", code: "EUR" },
  GBP: { symbol: "£", code: "GBP" },
  ETB: { symbol: "ETB", code: "ETB" },
  KES: { symbol: "KSh", code: "KES" },
  NGN: { symbol: "₦", code: "NGN" },
  ZAR: { symbol: "R", code: "ZAR" },
  GHS: { symbol: "GH₵", code: "GHS" },
  AED: { symbol: "AED", code: "AED" },
  INR: { symbol: "₹", code: "INR" },
  CAD: { symbol: "CA$", code: "CAD" },
  AUD: { symbol: "A$", code: "AUD" },
};

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) {
    return `${p[0]![0]}${p[p.length - 1]![0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "??";
}

export function Topbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { openModal } = useDashboardModals();
  const { toggleMobileSidebar } = useDashboardShell();
  const tRoutes = useTranslations("routes");
  const tTopbar = useTranslations("topbar");
  const tCurrency = useTranslations("currencyNames");
  const routeDef = getRouteDef(pathname);
  const rk = routeDef.routeKey;
  const title = tRoutes(`${rk}.title` as never);
  const crumb = tRoutes(`${rk}.crumb` as never);

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [mobileTopOpen, setMobileTopOpen] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState<
    (typeof CURRENCIES)["ETB"]
  >(CURRENCIES.ETB);

  const displayName = user?.name ?? tTopbar("userFallback");

  return (
    <>
      <header className="sticky top-0 z-50 flex min-h-[56px] shrink-0 flex-col gap-2 border-b border-loom-border bg-loom-topbar px-4 py-2 sm:px-5 md:h-[60px] md:flex-row md:items-center md:justify-between md:gap-3 md:px-7 md:py-0">
        <div className="flex w-full items-start gap-2 md:items-center md:gap-3">
          <button
            type="button"
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-loom-border bg-loom-surface text-loom-text-800 shadow-loom-xs md:hidden"
            aria-label={tTopbar("openNav")}
            onClick={toggleMobileSidebar}
          >
            <span className="text-xl leading-none" aria-hidden>
              ☰
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold leading-snug tracking-[-0.2px] text-loom-text-900 sm:text-base">
              {title}
            </div>
            <div className="hidden text-[11.5px] text-loom-text-400 md:block">{crumb}</div>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:flex-nowrap md:w-auto md:justify-end">
          <ThemeToggle />
          <LanguageToggle />
          <DashboardNotificationBell />

          <button
            type="button"
            title={tTopbar("changeCurrency")}
            onClick={() => setCurrencyOpen(true)}
            className="hidden min-h-9 cursor-pointer items-center justify-center rounded-md border border-loom-border bg-loom-surface px-3 font-mono text-[13px] font-semibold text-loom-text-700 shadow-loom-xs transition-colors hover:border-loom-border-2 hover:bg-loom-hover md:inline-flex"
          >
            {activeCurrency.code}
          </button>

          <span className="hidden items-center gap-1.5 rounded-md bg-gradient-to-br from-[#667eea] to-[#764ba2] px-2 py-0.5 text-[11px] font-bold tracking-[0.3px] text-white lg:inline-flex">
            {tTopbar("aiPowered")}
          </span>

          <button
            type="button"
            onClick={() => openModal("quick-add")}
            className="hidden min-h-9 cursor-pointer items-center gap-1.5 rounded-md border border-loom-border bg-loom-surface px-3 text-[13px] font-medium text-loom-text-700 shadow-loom-xs transition-colors hover:border-loom-border-2 hover:bg-loom-hover sm:inline-flex"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="hidden sm:inline">{tTopbar("addNew")}</span>
          </button>

          <button
            type="button"
            onClick={() => openModal("onboard-tenant")}
            className="hidden min-h-9 cursor-pointer items-center rounded-md border border-loom-blue-600 bg-loom-blue-600 px-3 text-[13px] font-medium text-white shadow-loom-xs transition-colors hover:border-[#1d4ed8] hover:bg-[#1d4ed8] md:inline-flex"
          >
            {tTopbar("onboardTenant")}
          </button>

          <button
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-loom-border bg-loom-surface text-[13px] font-semibold text-loom-text-700 shadow-loom-xs md:hidden"
            aria-label={tTopbar("moreActions")}
            aria-expanded={mobileTopOpen}
            onClick={() => setMobileTopOpen((v) => !v)}
          >
            ⋯
          </button>

          <div
            className="ml-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold text-white sm:h-10 sm:w-10"
            style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
            }}
            title={displayName}
          >
            {initials(displayName)}
          </div>
        </div>
      </header>

      {mobileTopOpen ? (
        <div className="fixed inset-0 z-[200] md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label={tTopbar("close")}
            onClick={() => setMobileTopOpen(false)}
          />
          <div className="absolute right-3 top-[72px] w-[min(100vw-24px,280px)] rounded-xl border border-loom-border bg-loom-surface p-2 shadow-loom-xl">
            <button
              type="button"
              onClick={() => {
                setCurrencyOpen(true);
                setMobileTopOpen(false);
              }}
              className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 font-mono text-[13px] font-semibold text-loom-text-800 hover:bg-loom-hover"
            >
              {tTopbar("currency")}
              <span className="rounded border border-loom-border px-2 py-0.5">{activeCurrency.code}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                openModal("quick-add");
                setMobileTopOpen(false);
              }}
              className="mt-1 flex min-h-11 w-full items-center rounded-lg px-3 text-left text-[13px] font-medium text-loom-text-700 hover:bg-loom-hover"
            >
              {tTopbar("addNew")}
            </button>
            <button
              type="button"
              onClick={() => {
                openModal("onboard-tenant");
                setMobileTopOpen(false);
              }}
              className="mt-1 flex min-h-11 w-full items-center rounded-lg px-3 text-left text-[13px] font-semibold text-loom-blue-600 hover:bg-loom-hover"
            >
              {tTopbar("onboardTenant")}
            </button>
          </div>
        </div>
      ) : null}

      {/* Currency modal — matches prototype overlay + modal */}
      <div
        className={`fixed inset-0 z-[300] flex items-end justify-center bg-slate-900/45 backdrop-blur-[3px] transition-opacity duration-200 sm:items-center ${
          currencyOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        role="presentation"
        onClick={() => setCurrencyOpen(false)}
      >
        <div
          className={`max-h-[100dvh] w-full max-w-[400px] overflow-y-auto rounded-none border border-loom-border bg-loom-surface shadow-loom-xl transition-transform duration-200 max-sm:min-h-[100dvh] sm:max-h-[90vh] sm:rounded-[18px] ${
            currencyOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.99]"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="currency-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-loom-border px-4 pb-4 pt-4 sm:px-6 sm:pb-[18px] sm:pt-[22px]">
            <div>
              <div
                id="currency-modal-title"
                className="text-base font-bold text-loom-text-900"
              >
                {tTopbar("selectCurrency")}
              </div>
              <div className="mt-0.5 text-xs text-loom-text-400">
                {tTopbar("amountsUpdate")}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrencyOpen(false)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-loom-border bg-transparent text-[17px] text-loom-text-400 transition-colors hover:bg-loom-hover hover:text-loom-text-900 sm:h-7 sm:min-h-0 sm:w-7 sm:min-w-0"
              aria-label={tTopbar("close")}
            >
              ✕
            </button>
          </div>
          <div className="p-3">
            {Object.values(CURRENCIES).map((c) => {
              const selected = activeCurrency.code === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setActiveCurrency(c);
                    setCurrencyOpen(false);
                  }}
                  className={`mb-1 flex w-full items-center justify-between rounded-md border-[1.5px] px-3.5 py-3 text-left transition-colors last:mb-0 ${
                    selected
                      ? "border-loom-blue-500 bg-loom-blue-50"
                      : "border-loom-border bg-loom-surface hover:border-loom-border-2 hover:bg-loom-hover"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-loom-bg-2 text-sm font-bold text-loom-text-700 font-mono">
                      {c.symbol}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-loom-text-900">
                        {c.code}
                      </div>
                      <div className="text-xs text-loom-text-400">
                        {tCurrency(c.code as never)}
                      </div>
                    </div>
                  </div>
                  {selected ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

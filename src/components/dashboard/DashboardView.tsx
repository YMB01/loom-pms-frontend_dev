"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { DashboardRevenueAreaChart } from "@/components/dashboard/charts/DashboardRevenueAreaChart";
import { OccupancyDonutChart } from "@/components/dashboard/charts/OccupancyDonutChart";
import { PaymentMethodsPieChart } from "@/components/dashboard/charts/PaymentMethodsPieChart";
import { RevenueByPropertyBarChart } from "@/components/dashboard/charts/RevenueByPropertyBarChart";
import {
  dashboardQueryKey,
  fetchDashboard,
} from "@/lib/queries/dashboard";
import type { DashboardData, DashboardRecentPayment } from "@/types/dashboard";
import {
  CardField,
  CardRow,
  ResponsiveTable,
} from "@/components/dashboard/ListPageUi";
import { useTheme } from "@/contexts/theme-context";
import {
  translateInvoiceStatus,
  translateMaintStatus,
  translatePaymentMethod,
  translatePriority,
} from "@/lib/i18n-labels";

function formatEtb(n: number): string {
  return `ETB ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatEtbCompact(n: number): string {
  if (n >= 1000) {
    return `ETB ${(n / 1000).toFixed(0)}K`;
  }
  return formatEtb(n);
}

function paymentStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "paid")
    return "bg-emerald-100 text-emerald-600";
  if (s === "partial")
    return "bg-amber-100 text-amber-600";
  if (s === "overdue") return "bg-red-100 text-red-600";
  return "bg-loom-blue-100 text-loom-blue-600";
}

function maintenanceStatusClass(status: string) {
  const s = status.toLowerCase();
  if (s === "resolved") return "bg-emerald-100 text-emerald-600";
  if (s === "in_progress") return "bg-amber-100 text-amber-600";
  return "bg-red-100 text-red-600";
}

function methodBadgeClass(method: string) {
  const m = method.toLowerCase();
  if (m.includes("telebirr")) return "bg-cyan-100 text-cyan-600";
  if (m.includes("cbe")) return "bg-loom-blue-100 text-loom-blue-600";
  if (m === "cash") return "bg-loom-bg-2 text-loom-text-500";
  if (m.includes("bank") || m.includes("transfer"))
    return "bg-violet-100 text-violet-600";
  return "bg-loom-bg-2 text-loom-text-500";
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return `${p[0]![0]}${p[p.length - 1]![0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

const avatarHue = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  const hues = [220, 280, 160, 30, 340, 200];
  return hues[h % hues.length]!;
};

function StatCardShell({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "blue" | "green" | "amber" | "red" | "cyan" | "purple";
}) {
  const accent = {
    blue: "bg-loom-blue-500",
    green: "bg-emerald-500",
    amber: "bg-loom-amber-500",
    red: "bg-red-500",
    cyan: "bg-cyan-500",
    purple: "bg-violet-600",
  }[tone];

  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-[14px] border border-loom-border bg-loom-surface p-5 shadow-loom-sm transition-all duration-150 hover:-translate-y-px hover:shadow-loom-md">
      {children}
      <div
        className={`absolute bottom-0 left-5 right-5 h-0.5 rounded-sm opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${accent}`}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[128px] rounded-[14px] border border-loom-border bg-loom-surface p-5 shadow-loom-sm"
          >
            <div className="mb-3.5 flex justify-between">
              <div className="h-9 w-9 rounded-[10px] bg-loom-bg-2" />
              <div className="h-5 w-14 rounded-full bg-loom-bg-2" />
            </div>
            <div className="mb-1.5 h-7 w-20 rounded bg-loom-bg-2" />
            <div className="h-4 w-28 rounded bg-loom-bg-2" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-[18px]">
          <div className="h-[320px] rounded-[14px] border border-loom-border bg-loom-surface shadow-loom-sm" />
          <div className="h-[280px] rounded-[14px] border border-loom-border bg-loom-surface shadow-loom-sm" />
        </div>
        <div className="flex flex-col gap-[18px]">
          <div className="h-[200px] rounded-[14px] border border-loom-border bg-loom-surface shadow-loom-sm" />
          <div className="h-[220px] rounded-[14px] border border-loom-border bg-loom-surface shadow-loom-sm" />
          <div className="h-[260px] rounded-[14px] border border-loom-border bg-loom-surface shadow-loom-sm" />
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ d }: { d: DashboardData }) {
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const stats = [
    {
      tone: "blue" as const,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[18px] w-[18px] stroke-loom-blue-600"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      iconBg: "bg-loom-blue-100",
      trend: (
        <span className="text-[11.5px] font-semibold text-emerald-600">
          {td("live")}
        </span>
      ),
      value: d.total_properties,
      label: td("totalProperties"),
      mono: false,
    },
    {
      tone: "green" as const,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[18px] w-[18px] stroke-emerald-600"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        </svg>
      ),
      iconBg: "bg-emerald-100",
      trend: (
        <span className="rounded-full bg-loom-bg-2 px-2 py-0.5 text-[11.5px] font-semibold text-loom-text-500">
          {d.total_units > 0
            ? td("occPercentTrend", {
                pct: String(
                  Math.round((d.occupied_units / d.total_units) * 100),
                ),
              })
            : tc("dash")}
        </span>
      ),
      value: d.total_units,
      label: td("totalUnits"),
      mono: true,
    },
    {
      tone: "green" as const,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[18px] w-[18px] stroke-emerald-600"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      iconBg: "bg-emerald-100",
      trend: (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-600">
          {td("target90")}
        </span>
      ),
      value: `${d.occupancy_rate}%`,
      label: td("occupancyRate"),
      mono: false,
    },
    {
      tone: "cyan" as const,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[18px] w-[18px] stroke-cyan-600"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      iconBg: "bg-cyan-100",
      trend: (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-600">
          {td("active")}
        </span>
      ),
      value: d.total_tenants,
      label: td("totalTenants"),
      mono: true,
    },
    {
      tone: "green" as const,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[18px] w-[18px] stroke-emerald-600"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      iconBg: "bg-emerald-100",
      trend: (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-600">
          {td("mtd")}
        </span>
      ),
      value: formatEtbCompact(d.revenue_this_month),
      label: td("monthlyRevenue"),
      mono: false,
      valueClass: "text-xl",
    },
    {
      tone: "amber" as const,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[18px] w-[18px] stroke-loom-amber-600"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      iconBg: "bg-loom-amber-100",
      trend: (
        <span className="rounded-full bg-loom-bg-2 px-2 py-0.5 text-[11.5px] font-semibold text-loom-text-500">
          {td("dueSoon")}
        </span>
      ),
      value: d.pending_invoices_count,
      label: td("pendingInvoices"),
      mono: true,
    },
    {
      tone: "red" as const,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[18px] w-[18px] stroke-red-600"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      iconBg: "bg-red-100",
      trend: (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11.5px] font-semibold text-red-600">
          {td("action")}
        </span>
      ),
      value: d.overdue_invoices_count,
      label: td("overdueInvoices"),
      mono: true,
    },
    {
      tone: "amber" as const,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[18px] w-[18px] stroke-loom-amber-600"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      ),
      iconBg: "bg-loom-amber-100",
      trend: (
        <span className="rounded-full bg-loom-bg-2 px-2 py-0.5 text-[11.5px] font-semibold text-loom-text-500">
          {td("open")}
        </span>
      ),
      value: d.open_maintenance_count,
      label: td("openMaintenance"),
      mono: true,
    },
  ];

  return (
    <div className="mb-[22px] grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4">
      {stats.map((s) => (
        <StatCardShell key={s.label} tone={s.tone}>
          <div className="mb-3.5 flex items-start justify-between">
            <div
              className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] ${s.iconBg}`}
            >
              {s.icon}
            </div>
            {s.trend}
          </div>
          <div
            className={`font-mono font-bold leading-none tracking-[-0.8px] text-loom-text-900 ${"valueClass" in s && s.valueClass ? s.valueClass : "text-[26px]"}`}
          >
            {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
          </div>
          <div className="mt-1.5 text-[12.5px] font-medium text-loom-text-500">
            {s.label}
          </div>
        </StatCardShell>
      ))}
    </div>
  );
}

function PaymentsTable({ rows }: { rows: DashboardRecentPayment[] }) {
  const td = useTranslations("dashboard");
  const ti = useTranslations("invoices");
  const tp = useTranslations("payments");

  if (rows.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-loom-text-400">
        {td("noPaymentsYet")}
      </p>
    );
  }
  const table = (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {[td("tenant"), td("unit"), td("amount"), td("method"), td("status")].map(
            (h) => (
              <th
                key={h}
                className="border-b border-loom-border bg-loom-surface-2 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.6px] text-loom-text-400 first:rounded-tl-md last:rounded-tr-md"
              >
                {h}
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => (
          <tr
            key={p.id}
            className="border-b border-loom-border transition-colors last:border-b-0 hover:bg-loom-hover"
          >
            <td className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{
                    background: `hsl(${avatarHue(p.tenant_name)}, 55%, 46%)`,
                  }}
                >
                  {initials(p.tenant_name)}
                </div>
                <span className="font-semibold text-loom-text-900">
                  {p.tenant_name}
                </span>
              </div>
            </td>
            <td className="px-4 py-3 font-mono text-[12.5px] text-loom-text-500">
              {p.unit}
            </td>
            <td className="px-4 py-3 font-mono font-semibold text-emerald-600">
              {formatEtb(p.amount)}
            </td>
            <td className="px-4 py-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${methodBadgeClass(p.method)}`}
              >
                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-current" />
                {translatePaymentMethod(p.method, (k) => tp(k))}
              </span>
            </td>
            <td className="px-4 py-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${paymentStatusBadge(p.invoice_status)}`}
              >
                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-current" />
                {translateInvoiceStatus(p.invoice_status, (k) => ti(k))}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  const cards = (
    <>
      {rows.map((p) => (
        <CardRow key={p.id}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold text-white"
              style={{
                background: `hsl(${avatarHue(p.tenant_name)}, 55%, 46%)`,
              }}
            >
              {initials(p.tenant_name)}
            </div>
            <span className="text-[15px] font-semibold text-loom-text-900">
              {p.tenant_name}
            </span>
          </div>
          <CardField label={td("unit")}>
            <span className="font-mono text-[12.5px] text-loom-text-500">
              {p.unit}
            </span>
          </CardField>
          <CardField label={td("amount")}>
            <span className="font-mono font-semibold text-emerald-600">
              {formatEtb(p.amount)}
            </span>
          </CardField>
          <CardField label={td("method")}>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${methodBadgeClass(p.method)}`}
            >
              <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-current" />
              {translatePaymentMethod(p.method, (k) => tp(k))}
            </span>
          </CardField>
          <CardField label={td("status")}>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${paymentStatusBadge(p.invoice_status)}`}
            >
              <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-current" />
              {translateInvoiceStatus(p.invoice_status, (k) => ti(k))}
            </span>
          </CardField>
        </CardRow>
      ))}
    </>
  );
  return <ResponsiveTable embedded table={table} cards={cards} />;
}

export function DashboardView() {
  const { isDark } = useTheme();
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const tq = useTranslations("query");
  const tm = useTranslations("maintStatus");
  const tpri = useTranslations("priority");
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboard,
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-[14px] border border-red-200 bg-red-50 p-6 shadow-loom-sm">
        <p className="text-sm font-semibold text-red-800">
          {error instanceof Error ? error.message : tq("couldNotLoadDashboard")}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-md border border-loom-border bg-loom-surface px-4 py-2 text-sm font-semibold text-loom-text-700 shadow-loom-xs transition-colors hover:bg-loom-hover"
        >
          {tc("retry")}
        </button>
      </div>
    );
  }

  const vacant =
    data.vacant_units ??
    Math.max(0, data.total_units - data.occupied_units);
  const maintenanceUnits = data.units_in_maintenance ?? 0;

  const yearLabel = new Date().getFullYear();

  return (
    <div className="animate-loom-page-in space-y-5">
      {isFetching && !isLoading ? (
        <div className="text-xs font-medium text-loom-text-400">
          {td("updating")}
        </div>
      ) : null}

      <StatsGrid d={data} />

      <div className="rounded-[14px] border border-loom-border bg-loom-surface p-4 shadow-loom-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-bold text-loom-text-900">
              {td("revenueOverview")}
            </div>
            <div className="mt-px text-xs text-loom-text-400">
              {td("collectedRent6m")}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-loom-text-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-3 rounded-sm bg-[#3b82f6]" />
              {td("expectedRevenue")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-3 rounded-sm bg-emerald-500" />
              {td("collectedRevenue")}
            </span>
          </div>
        </div>
        <DashboardRevenueAreaChart data={data.revenue_chart} isDark={isDark} />
        <div className="mt-3.5 border-t border-loom-border pt-3.5 text-[12.5px] text-loom-text-500">
          {td("fiscalYear", { year: String(yearLabel) })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-[14px] border border-loom-border bg-loom-surface p-4 shadow-loom-sm sm:p-5">
          <div className="mb-3 text-sm font-bold text-loom-text-900">
            {td("revenueByPropertyTitle")}
          </div>
          <RevenueByPropertyBarChart
            rows={data.revenue_by_property ?? []}
            isDark={isDark}
          />
        </div>
        <div className="rounded-[14px] border border-loom-border bg-loom-surface p-4 shadow-loom-sm sm:p-5">
          <div className="mb-3 text-sm font-bold text-loom-text-900">
            {td("paymentMethodMix")}
          </div>
          <PaymentMethodsPieChart
            slices={data.payment_method_breakdown ?? []}
            isDark={isDark}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-[18px]">
          <div className="rounded-[14px] border border-loom-border bg-loom-surface shadow-loom-sm">
            <div className="flex items-center justify-between border-b border-transparent px-5 pb-3.5 pt-[18px]">
              <div className="text-sm font-bold text-loom-text-900">
                {td("recentPayments")}
              </div>
              <Link
                href="/dashboard/payments"
                className="text-[12.5px] font-semibold text-loom-blue-600 hover:underline"
              >
                {td("viewAll")}
              </Link>
            </div>
            <PaymentsTable rows={data.recent_payments} />
          </div>
        </div>

        <div className="flex flex-col gap-[18px]">
          <div className="rounded-[14px] border border-loom-border bg-loom-surface shadow-loom-sm">
            <div className="border-b border-transparent px-5 pb-3.5 pt-[18px]">
              <div className="text-sm font-bold text-loom-text-900">
                {td("occupancyRateTitle")}
              </div>
            </div>
            <div className="px-5 pb-5 pt-2">
              <OccupancyDonutChart
                occupied={data.occupied_units}
                vacant={vacant}
                maintenance={maintenanceUnits}
                occupancyRate={data.occupancy_rate}
                totalUnits={data.total_units}
                isDark={isDark}
              />
            </div>
          </div>

          <div className="rounded-[14px] border border-loom-border bg-loom-surface shadow-loom-sm">
            <div className="flex items-center justify-between border-b border-transparent px-5 pb-3 pt-[18px]">
              <div className="text-sm font-bold text-loom-text-900">
                {td("recentMaintenance")}
              </div>
              <Link
                href="/dashboard/maintenance"
                className="text-[12.5px] font-semibold text-loom-blue-600 hover:underline"
              >
                {td("viewAll")}
              </Link>
            </div>
            <div className="flex flex-col gap-2.5 px-5 pb-5">
              {data.recent_maintenance.length === 0 ? (
                <p className="py-4 text-center text-xs text-loom-text-400">
                  {td("noMaintenanceYet")}
                </p>
              ) : (
                data.recent_maintenance.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-md border border-loom-border bg-loom-bg px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-loom-text-900">
                          {m.title}
                        </div>
                        <div className="mt-0.5 text-[11.5px] text-loom-text-500">
                          {m.unit} · {m.property_name}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${maintenanceStatusClass(m.status)}`}
                      >
                        {translateMaintStatus(m.status, (k) => tm(k))}
                      </span>
                    </div>
                    <div className="mt-1.5 text-[11px] text-loom-text-400">
                      {td("priority")}:{" "}
                      {translatePriority(m.priority, (k) => tpri(k))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[14px] border border-loom-border bg-loom-surface shadow-loom-sm">
            <div className="flex items-center justify-between border-b border-transparent px-5 pb-3 pt-[18px]">
              <div className="text-sm font-bold text-loom-text-900">
                {td("smsProvider")}
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11.5px] font-semibold text-emerald-600">
                <span className="h-[5px] w-[5px] rounded-full bg-current" />
                {td("active")}
              </span>
            </div>
            <div className="px-5 pb-5">
              <div className="mb-3 rounded-md bg-loom-bg px-3 py-3">
                <div className="text-xs text-loom-text-400">{td("primary")}</div>
                <div className="text-[13.5px] font-bold text-loom-text-900">
                  {data.sms.primary_provider}
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-loom-text-500">{td("sentToday")}</span>
                  <span className="font-mono font-semibold text-loom-text-900">
                    {data.sms.sent_today}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-loom-text-500">{td("sentTotal")}</span>
                  <span className="font-mono font-semibold text-loom-text-900">
                    {data.sms.sent_total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-loom-text-500">
                    {td("deliveryRate")}
                  </span>
                  <span className="font-mono font-semibold text-emerald-600">
                    {data.sms.delivery_rate_percent}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-loom-text-500">{td("failed")}</span>
                  <span
                    className={`font-mono font-semibold ${data.sms.failed > 0 ? "text-red-600" : "text-loom-text-900"}`}
                  >
                    {data.sms.failed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-loom-text-500">{td("queued")}</span>
                  <span className="font-mono font-semibold text-loom-text-900">
                    {data.sms.queued}
                  </span>
                </div>
              </div>
              <hr className="my-3 border-loom-border" />
              <Link
                href="/dashboard/sms"
                className="flex h-9 w-full items-center justify-center rounded-md border border-loom-border bg-loom-surface text-[13px] font-semibold text-loom-text-700 shadow-loom-xs transition-colors hover:bg-loom-hover"
              >
                {td("openSmsCenter")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

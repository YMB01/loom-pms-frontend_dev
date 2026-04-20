"use client";

import { useQuery } from "@tanstack/react-query";
import { SuperAdminCompanyGrowthChart } from "@/components/super-admin/charts/SuperAdminCompanyGrowthChart";
import { useTheme } from "@/contexts/theme-context";
import { superAdminApi } from "@/lib/super-admin-api";
import type { SuperAdminDashboardApiResponse } from "@/types/super-admin";

function formatUsd(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function SuperAdminDashboardPage() {
  const { isDark } = useTheme();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["super-admin", "dashboard"],
    queryFn: async () => {
      const { data: res } =
        await superAdminApi.get<SuperAdminDashboardApiResponse>(
          "/super-admin/dashboard",
        );
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to load dashboard");
      }
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-loom-blue-600 border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-loom-border bg-loom-surface p-6 shadow-loom-sm">
        <p className="text-sm text-loom-red-600">
          {error instanceof Error ? error.message : "Could not load metrics."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 text-sm font-medium text-loom-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const health = data.system_health;
  const growth = data.company_signups_by_month ?? [];
  const recent = data.recent_companies ?? [];
  const rp = data.revenue_by_plan;

  const statCards = [
    { label: "Total companies", value: data.total_companies },
    { label: "Active companies", value: data.active_companies },
    { label: "Suspended", value: data.suspended_companies },
    { label: "Trial subscriptions", value: data.trial_companies },
    { label: "New signups (7 days)", value: data.new_signups_this_week },
    { label: "New today", value: data.new_signups_today },
    { label: "MRR (est.)", value: formatUsd(data.mrr), sub: "Active paid plans" },
    { label: "ARR (est.)", value: formatUsd(data.arr) },
    {
      label: "Properties (all tenants)",
      value: data.total_properties_across_all,
    },
    { label: "Units (all tenants)", value: data.total_units_across_all },
    { label: "Tenants (all)", value: data.total_tenants_across_all },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-loom-text-900 dark:text-loom-text-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-loom-text-500">
          Platform-wide metrics — isolated from individual company PMS data.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {statCards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-loom-border bg-loom-surface p-5 shadow-loom-sm dark:border-loom-border dark:bg-loom-surface"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-loom-text-400">
              {c.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-loom-text-900 dark:text-loom-text-50">
              {c.value}
            </p>
            {"sub" in c && c.sub ? (
              <p className="mt-1 text-xs text-loom-text-400">{c.sub}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-loom-border bg-loom-surface p-5 shadow-loom-sm dark:border-loom-border">
        <h2 className="text-sm font-semibold text-loom-text-900 dark:text-loom-text-50">
          Plans on platform
        </h2>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-loom-text-600">
          <span>
            Free: <strong className="text-loom-text-900 dark:text-loom-text-100">{rp.free}</strong>
          </span>
          <span>
            Starter:{" "}
            <strong className="text-loom-text-900 dark:text-loom-text-100">{rp.starter}</strong>
          </span>
          <span>
            Business:{" "}
            <strong className="text-loom-text-900 dark:text-loom-text-100">{rp.business}</strong>
          </span>
          <span>
            Enterprise:{" "}
            <strong className="text-loom-text-900 dark:text-loom-text-100">{rp.enterprise}</strong>
          </span>
        </div>
        <p className="mt-2 text-xs text-loom-text-400">
          Marketplace today: {data.marketplace_orders_today} orders ·{" "}
          {formatUsd(data.marketplace_revenue_today)} revenue
        </p>
      </div>

      <div className="rounded-xl border border-loom-border bg-loom-surface p-4 shadow-loom-sm md:p-6 dark:border-loom-border">
        <h2 className="text-sm font-semibold text-loom-text-900 dark:text-loom-text-50">
          Company growth (last 12 months)
        </h2>
        <p className="mt-1 text-xs text-loom-text-500">
          Monthly new signups (bars) and cumulative companies (line).
        </p>
        <div className="mt-4">
          <SuperAdminCompanyGrowthChart
            data={growth}
            isDark={isDark}
            isLoading={false}
            labels={{
              newSignups: "New signups",
              cumulative: "Total companies",
              empty: "No signup data yet.",
            }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-loom-border bg-loom-surface p-5 shadow-loom-sm dark:border-loom-border">
        <h2 className="text-sm font-semibold text-loom-text-900 dark:text-loom-text-50">
          Recent companies
        </h2>
        <ul className="mt-4 divide-y divide-loom-border text-sm">
          {recent.length === 0 ? (
            <li className="py-3 text-loom-text-500">No companies yet.</li>
          ) : (
            recent.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <span className="font-medium text-loom-text-800 dark:text-loom-text-100">
                  {c.name}
                </span>
                <span className="text-loom-text-500">{c.email ?? "—"}</span>
                <span className="text-xs text-loom-text-400">
                  {formatDate(c.created_at)}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-loom-border bg-loom-surface p-5 shadow-loom-sm dark:border-loom-border">
        <h2 className="text-sm font-semibold text-loom-text-900 dark:text-loom-text-50">
          System health
        </h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-loom-text-600">
          <span className="rounded-full bg-loom-surface-2 px-2 py-0.5 dark:bg-loom-hover">
            DB: {health.database}
          </span>
          <span className="rounded-full bg-loom-surface-2 px-2 py-0.5 dark:bg-loom-hover">
            SMS: {health.sms}
          </span>
          <span className="rounded-full bg-loom-surface-2 px-2 py-0.5 dark:bg-loom-hover">
            Storage: {health.storage}
          </span>
          <span className="rounded-full bg-loom-surface-2 px-2 py-0.5 dark:bg-loom-hover">
            Queue: {health.queue}
          </span>
        </div>
      </div>
    </div>
  );
}

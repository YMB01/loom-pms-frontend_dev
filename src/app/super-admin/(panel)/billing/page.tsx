"use client";

import { useQuery } from "@tanstack/react-query";
import { SuperAdminMrrStackedAreaChart } from "@/components/super-admin/charts/SuperAdminMrrStackedAreaChart";
import { useTheme } from "@/contexts/theme-context";
import { superAdminApi } from "@/lib/super-admin-api";
import type { SuperAdminBillingApiResponse } from "@/types/super-admin";

function formatUsd(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function paymentStatusBadge(status: string) {
  const s = status.toLowerCase();
  const styles =
    s === "paid"
      ? "bg-emerald-100 text-emerald-800"
      : s === "failed"
        ? "bg-red-100 text-red-800"
        : s === "overdue"
          ? "bg-amber-100 text-amber-900"
          : "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  );
}

export default function SuperAdminBillingPage() {
  const { isDark } = useTheme();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["super-admin", "billing"],
    queryFn: async () => {
      const { data: res } =
        await superAdminApi.get<SuperAdminBillingApiResponse>(
          "/super-admin/billing"
        );
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to load billing");
      }
      return res.data;
    },
  });

  const rev = data?.revenue;
  const br = data?.breakdown;
  const payments = data?.payments ?? [];
  const mrrStack = rev?.mrr_stacked_by_month ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-loom-text-900">
            Billing &amp; revenue
          </h1>
          <p className="mt-1 text-sm text-loom-text-500">
            SaaS subscription revenue (Stripe). Tenant rent payments are tracked
            separately in each company account.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="rounded-lg border border-loom-border bg-loom-surface px-3 py-1.5 text-sm font-medium text-loom-text-700 shadow-loom-xs hover:bg-loom-surface-2 disabled:opacity-60"
        >
          {isRefetching ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-loom-border bg-loom-surface p-4 shadow-loom-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-loom-text-500">
            This month
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-loom-text-900">
            {isLoading ? "—" : formatUsd(rev?.this_month ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-loom-border bg-loom-surface p-4 shadow-loom-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-loom-text-500">
            This year
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-loom-text-900">
            {isLoading ? "—" : formatUsd(rev?.this_year ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-loom-border bg-loom-surface p-4 shadow-loom-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-loom-text-500">
            All time
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-loom-text-900">
            {isLoading ? "—" : formatUsd(rev?.all_time ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-loom-border bg-loom-surface p-4 shadow-loom-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-loom-text-500">
            MRR (est.)
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-700">
            {isLoading ? "—" : formatUsd(br?.total_mrr ?? 0)}
          </p>
          <p className="mt-1 text-[11px] text-loom-text-400">
            Active Basic + Pro × plan price
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-loom-border bg-loom-surface p-4 shadow-loom-sm md:p-6 dark:border-loom-border">
        <h2 className="text-sm font-semibold text-loom-text-900 dark:text-loom-text-50">
          MRR by plan (last 12 months)
        </h2>
        <p className="mt-1 text-xs text-loom-text-500">
          Stacked paid subscription revenue by plan (from Stripe). Line shows monthly total.
        </p>
        <div className="mt-4">
          <SuperAdminMrrStackedAreaChart
            data={mrrStack}
            isDark={isDark}
            isLoading={isLoading}
            formatUsd={formatUsd}
            labels={{
              free: "Free",
              starter: "Starter (Basic)",
              business: "Business (Pro)",
              enterprise: "Enterprise",
              total: "Total MRR",
              empty: "No subscription payment data yet.",
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-loom-border bg-loom-surface p-4 shadow-loom-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-loom-text-500">
            Free
          </h3>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-loom-text-900">
            {br?.free_count ?? 0}
          </p>
          <p className="mt-1 text-sm text-loom-text-500">companies</p>
        </div>
        <div className="rounded-xl border border-loom-border bg-loom-surface p-4 shadow-loom-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-loom-text-500">
            Basic
          </h3>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-loom-text-900">
            {br?.basic_count ?? 0}
          </p>
          <p className="mt-1 text-sm text-loom-text-500">
            {formatUsd(br?.basic_price ?? 29)} × {br?.basic_paying_count ?? 0}{" "}
            paying ={" "}
            <span className="font-medium text-loom-text-800">
              {formatUsd(br?.basic_mrr ?? 0)}
            </span>
            /mo
          </p>
        </div>
        <div className="rounded-xl border border-loom-border bg-loom-surface p-4 shadow-loom-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-loom-text-500">
            Pro
          </h3>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-loom-text-900">
            {br?.pro_count ?? 0}
          </p>
          <p className="mt-1 text-sm text-loom-text-500">
            {formatUsd(br?.pro_price ?? 79)} × {br?.pro_paying_count ?? 0}{" "}
            paying ={" "}
            <span className="font-medium text-loom-text-800">
              {formatUsd(br?.pro_mrr ?? 0)}
            </span>
            /mo
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-loom-border bg-loom-surface shadow-loom-sm">
        <div className="border-b border-loom-border px-4 py-3 md:px-5">
          <h2 className="text-sm font-semibold text-loom-text-900">
            Subscription payments
          </h2>
          <p className="mt-0.5 text-xs text-loom-text-500">
            From Stripe invoices (paid / failed / overdue).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-loom-border bg-loom-surface-2 text-xs uppercase tracking-wide text-loom-text-500">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Date paid</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-loom-text-500"
                  >
                    Loading…
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-loom-text-500"
                  >
                    No subscription payments yet. Connect Stripe and complete a
                    checkout to see data here.
                  </td>
                </tr>
              ) : (
                payments.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-loom-border last:border-0 hover:bg-loom-surface-2/60"
                  >
                    <td className="px-4 py-3 font-medium text-loom-text-900">
                      {row.company_name}
                    </td>
                    <td className="px-4 py-3 capitalize text-loom-text-700">
                      {row.plan}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-loom-text-700">
                      {formatUsd(row.amount)} {row.currency}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-loom-text-600">
                      {formatDate(row.date_paid)}
                    </td>
                    <td className="px-4 py-3">{paymentStatusBadge(row.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

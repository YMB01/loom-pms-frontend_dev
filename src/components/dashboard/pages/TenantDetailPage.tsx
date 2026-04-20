"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { TenantPaymentHistoryChart } from "@/components/dashboard/charts/TenantPaymentHistoryChart";
import { formatEtb, QueryError } from "@/components/dashboard/ListPageUi";
import { useTheme } from "@/contexts/theme-context";
import { api } from "@/lib/api";
import type { ApiEnvelope } from "@/types/api";
import type { TenantPaymentHistoryChartResponse } from "@/types/dashboard";
import type { Tenant } from "@/types/resources";

export function TenantDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const { isDark } = useTheme();
  const tt = useTranslations("tenants");
  const tq = useTranslations("query");
  const tc = useTranslations("common");

  const tenantQ = useQuery({
    queryKey: ["tenants", id, "detail"],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<{ tenant: Tenant }>>(`/tenants/${id}`);
      if (!data.success || !data.data?.tenant) {
        throw new Error(data.message || "Request failed");
      }
      return data.data.tenant;
    },
  });

  const chartQ = useQuery({
    queryKey: ["tenants", id, "payment-history-chart"],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<TenantPaymentHistoryChartResponse>>(
        `/tenants/${id}/payment-history-chart`,
      );
      if (!data.success || data.data == null) {
        throw new Error(data.message || "Request failed");
      }
      return data.data;
    },
  });

  if (tenantQ.isError || chartQ.isError) {
    return (
      <QueryError
        message={
          tenantQ.error instanceof Error
            ? tenantQ.error.message
            : chartQ.error instanceof Error
              ? chartQ.error.message
              : tq("loadFailed")
        }
        onRetry={() => {
          void tenantQ.refetch();
          void chartQ.refetch();
        }}
      />
    );
  }

  return (
    <div className="animate-loom-page-in space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/tenants"
          className="text-[13px] font-semibold text-loom-blue-600 hover:underline"
        >
          ← {tt("backToList")}
        </Link>
      </div>

      <header>
        <h1 className="text-[22px] font-bold text-loom-text-900 dark:text-loom-text-50">
          {tenantQ.isLoading ? tc("loading") : tenantQ.data?.name ?? tc("dash")}
        </h1>
        <p className="mt-1 text-[13px] text-loom-text-500">
          {tenantQ.data?.email ?? tc("dash")}
        </p>
      </header>

      <section className="rounded-2xl border border-loom-border bg-loom-surface p-4 shadow-loom-xs md:p-6 dark:border-loom-border">
        <h2 className="text-[15px] font-semibold text-loom-text-900 dark:text-loom-text-100">
          {tt("paymentHistoryTitle")}
        </h2>
        <p className="mt-1 text-[12px] text-loom-text-500">
          {tt("paymentHistorySubtitle")}
        </p>
        <div className="mt-4">
          <TenantPaymentHistoryChart
            data={chartQ.data}
            isDark={isDark}
            isLoading={chartQ.isLoading}
            formatAmount={formatEtb}
            labels={{
              paid: tt("paidBar"),
              expected: tt("expectedRent"),
            }}
            empty={tt("chartEmpty")}
          />
        </div>
      </section>
    </div>
  );
}

"use client";

import { useDashboardModals } from "@/contexts/dashboard-modals-context";
import { useTheme } from "@/contexts/theme-context";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { InvoiceStatusSparklineCards } from "@/components/dashboard/charts/InvoiceStatusSparklineCards";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { api } from "@/lib/api";
import { fetchPaginated } from "@/lib/fetch-paginated";
import {
  fetchPropertyOptions,
  propertyOptionsQueryKey,
} from "@/lib/queries/property-options";
import type { InvoiceChartSummary } from "@/types/dashboard";
import type { ApiEnvelope } from "@/types/api";
import type { Invoice } from "@/types/resources";
import { translateInvoiceStatus } from "@/lib/i18n-labels";
import {
  CardField,
  CardRow,
  ListPageToolbar,
  PaginationBar,
  PropertySelect,
  QueryError,
  ResponsiveTable,
  SearchInput,
  StatusTabs,
  TableCard,
  TableSkeleton,
  Td,
  Th,
  formatEtb,
  invoiceStatusBadge,
} from "@/components/dashboard/ListPageUi";

export function InvoicesPage() {
  const { isDark } = useTheme();
  const ti = useTranslations("invoices");
  const tq = useTranslations("query");
  const tc = useTranslations("common");
  const tunits = useTranslations("units");
  const { openModal } = useDashboardModals();
  const invTabs = useMemo(
    () => [
      { id: "all", label: tc("all") },
      { id: "pending", label: ti("pending") },
      { id: "overdue", label: ti("overdue") },
      { id: "partial", label: ti("partial") },
      { id: "paid", label: ti("paid") },
    ],
    [tc, ti],
  );
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [propertyId, setPropertyId] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [page, setPage] = useState(1);

  const propsQ = useQuery({
    queryKey: propertyOptionsQueryKey,
    queryFn: fetchPropertyOptions,
    staleTime: 60_000,
  });

  const chartQ = useQuery({
    queryKey: ["invoices", "chart-summary"],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<InvoiceChartSummary>>("/invoices/chart-summary");
      if (!data.success || data.data == null) {
        throw new Error(data.message || "Request failed");
      }
      return data.data;
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, propertyId, statusTab]);

  const q = useQuery({
    queryKey: ["invoices", "list", { page, search: debouncedSearch, propertyId, statusTab }],
    queryFn: () =>
      fetchPaginated<Invoice>(
        "/invoices",
        {
          page,
          per_page: 15,
          property_id: propertyId ? Number(propertyId) : undefined,
          status: statusTab,
          search: debouncedSearch || undefined,
        },
        { statusKey: "status" },
      ),
  });

  if (q.isError) {
    return (
      <QueryError
        message={q.error instanceof Error ? q.error.message : tq("loadFailed")}
        onRetry={() => void q.refetch()}
      />
    );
  }

  return (
    <div className="animate-loom-page-in">
      <ListPageToolbar
        actions={
          <button
            type="button"
            onClick={() => openModal("generate-invoices")}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8]"
          >
            {ti("generateMonthly")}
          </button>
        }
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={ti("searchPlaceholder")}
        />
        <PropertySelect
          value={propertyId}
          onChange={setPropertyId}
          properties={propsQ.data ?? []}
          disabled={propsQ.isLoading}
        />
      </ListPageToolbar>

      <InvoiceStatusSparklineCards
        summary={chartQ.data}
        isLoading={chartQ.isLoading}
        isDark={isDark}
        activeTab={statusTab}
        onSelect={setStatusTab}
        pipelineTitle={ti("pipelineTitle")}
        hint={ti("pipelineHint")}
        clearFilter={ti("clearPipelineFilter")}
        totalLabel={ti("totalAmount")}
        formatAmount={(n) => formatEtb(n)}
        labels={{
          pending: ti("pending"),
          overdue: ti("overdue"),
          paid: ti("paid"),
          partial: ti("partial"),
        }}
      />

      <StatusTabs tabs={invTabs} active={statusTab} onChange={setStatusTab} />

      {q.isLoading ? (
        <TableCard>
          <TableSkeleton cols={8} />
        </TableCard>
      ) : (
        <ResponsiveTable
          table={
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th>{ti("invoice")}</Th>
                  <Th>{ti("tenant")}</Th>
                  <Th>{ti("property")}</Th>
                  <Th>{ti("due")}</Th>
                  <Th>{ti("amount")}</Th>
                  <Th>{ti("status")}</Th>
                  <Th>{ti("smsCol")}</Th>
                  <Th>{tc("actions")}</Th>
                </tr>
              </thead>
              <tbody>
                {q.data?.items.length === 0 ? (
                  <tr>
                    <Td colSpan={8} className="py-12 text-center text-loom-text-400">
                      {ti("noMatch")}
                    </Td>
                  </tr>
                ) : (
                  q.data?.items.map((inv) => {
                    const tenantName = inv.tenant?.name ?? tc("dash");
                    const propName =
                      inv.lease?.unit?.property?.name ??
                      (inv.lease?.unit
                        ? tunits("propertyRef", {
                            id: String(inv.lease.unit.property_id),
                          })
                        : tc("dash"));
                    return (
                      <tr key={inv.id} className="transition-colors hover:bg-loom-hover">
                        <Td className="font-mono font-semibold text-loom-text-900">#{inv.id}</Td>
                        <Td className="font-semibold text-loom-text-900">{tenantName}</Td>
                        <Td className="text-loom-text-700">{propName}</Td>
                        <Td className="font-mono text-[12.5px]">{inv.due_date ?? tc("dash")}</Td>
                        <Td className="font-mono font-semibold">{formatEtb(inv.amount)}</Td>
                        <Td>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${invoiceStatusBadge(inv.status)}`}
                          >
                            <span className="h-[5px] w-[5px] rounded-full bg-current" />
                            {translateInvoiceStatus(inv.status, (k) => ti(k))}
                          </span>
                        </Td>
                        <Td>
                          <span className="text-xs text-loom-text-400">{tc("dash")}</span>
                        </Td>
                        <Td>
                          <button
                            type="button"
                            className="rounded-md border border-loom-border bg-loom-surface px-2.5 py-1 text-[12px] font-semibold text-loom-text-700 shadow-loom-xs hover:bg-loom-hover"
                          >
                            {tc("view")}
                          </button>
                        </Td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          }
          cards={
            <>
              {q.data?.items.length === 0 ? (
                <p className="py-10 text-center text-sm text-loom-text-400">
                  {ti("noMatch")}
                </p>
              ) : (
                q.data?.items.map((inv) => {
                  const tenantName = inv.tenant?.name ?? tc("dash");
                  const propName =
                    inv.lease?.unit?.property?.name ??
                    (inv.lease?.unit
                      ? tunits("propertyRef", {
                          id: String(inv.lease.unit.property_id),
                        })
                      : tc("dash"));
                  return (
                    <CardRow key={inv.id}>
                      <div className="font-mono text-lg font-bold text-loom-text-900">#{inv.id}</div>
                      <CardField label={ti("tenant")}>
                        <span className="font-semibold">{tenantName}</span>
                      </CardField>
                      <CardField label={ti("property")}>{propName}</CardField>
                      <CardField label={ti("due")}>
                        <span className="font-mono text-[12.5px]">{inv.due_date ?? tc("dash")}</span>
                      </CardField>
                      <CardField label={ti("amount")}>
                        <span className="font-mono font-semibold">{formatEtb(inv.amount)}</span>
                      </CardField>
                      <CardField label={ti("status")}>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${invoiceStatusBadge(inv.status)}`}
                        >
                          <span className="h-[5px] w-[5px] rounded-full bg-current" />
                          {translateInvoiceStatus(inv.status, (k) => ti(k))}
                        </span>
                      </CardField>
                      <CardField label={ti("smsCol")}>
                        <span className="text-xs text-loom-text-400">{tc("dash")}</span>
                      </CardField>
                      <button
                        type="button"
                        className="min-h-11 w-full rounded-md border border-loom-border bg-loom-surface px-3 text-[13px] font-semibold text-loom-text-700 shadow-loom-xs"
                      >
                        {tc("view")}
                      </button>
                    </CardRow>
                  );
                })
              )}
            </>
          }
          footer={
            q.data && q.data.meta.total > 0 ? (
              <PaginationBar meta={q.data.meta} onPage={setPage} disabled={q.isFetching} />
            ) : null
          }
        />
      )}
    </div>
  );
}

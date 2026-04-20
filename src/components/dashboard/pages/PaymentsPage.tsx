"use client";

import { useDashboardModals } from "@/contexts/dashboard-modals-context";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { fetchPaginated } from "@/lib/fetch-paginated";
import {
  fetchPropertyOptions,
  propertyOptionsQueryKey,
} from "@/lib/queries/property-options";
import type { Payment } from "@/types/resources";
import { translatePaymentMethod } from "@/lib/i18n-labels";
import {
  CardField,
  CardRow,
  ListPageToolbar,
  PaginationBar,
  PropertySelect,
  QueryError,
  ResponsiveTable,
  SearchInput,
  TableCard,
  TableSkeleton,
  Td,
  Th,
  formatEtb,
} from "@/components/dashboard/ListPageUi";

function methodBadge(method: string | null | undefined): string {
  const m = (method ?? "").toLowerCase();
  if (m.includes("telebirr")) return "bg-cyan-100 text-cyan-600";
  if (m.includes("cbe")) return "bg-loom-blue-100 text-loom-blue-600";
  if (m === "cash") return "bg-loom-bg-2 text-loom-text-500";
  if (m.includes("bank") || m.includes("transfer")) return "bg-violet-100 text-violet-600";
  return "bg-loom-bg-2 text-loom-text-500";
}

export function PaymentsPage() {
  const tp = useTranslations("payments");
  const tq = useTranslations("query");
  const tc = useTranslations("common");
  const tunits = useTranslations("units");
  const { openModal } = useDashboardModals();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [propertyId, setPropertyId] = useState("");
  const [page, setPage] = useState(1);

  const propsQ = useQuery({
    queryKey: propertyOptionsQueryKey,
    queryFn: fetchPropertyOptions,
    staleTime: 60_000,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, propertyId]);

  const q = useQuery({
    queryKey: ["payments", "list", { page, search: debouncedSearch, propertyId }],
    queryFn: () =>
      fetchPaginated<Payment>("/payments", {
        page,
        per_page: 15,
        property_id: propertyId ? Number(propertyId) : undefined,
        search: debouncedSearch || undefined,
      }),
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
            onClick={() => openModal("record-payment")}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8]"
          >
            {tp("recordPayment")}
          </button>
        }
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={tp("searchPlaceholder")}
        />
        <PropertySelect
          value={propertyId}
          onChange={setPropertyId}
          properties={propsQ.data ?? []}
          disabled={propsQ.isLoading}
        />
      </ListPageToolbar>

      {q.isLoading ? (
        <TableCard>
          <TableSkeleton cols={7} />
        </TableCard>
      ) : (
        <ResponsiveTable
          table={
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th>{tp("tenant")}</Th>
                  <Th>{tp("property")}</Th>
                  <Th>{tp("amount")}</Th>
                  <Th>{tp("method")}</Th>
                  <Th>{tp("reference")}</Th>
                  <Th>{tp("date")}</Th>
                  <Th>{tc("actions")}</Th>
                </tr>
              </thead>
              <tbody>
                {q.data?.items.length === 0 ? (
                  <tr>
                    <Td colSpan={7} className="py-12 text-center text-loom-text-400">
                      {tp("noMatch")}
                    </Td>
                  </tr>
                ) : (
                  q.data?.items.map((p) => {
                    const tenantName = p.tenant?.name ?? tc("dash");
                    const propName =
                      p.invoice?.lease?.unit?.property?.name ??
                      (p.invoice?.lease?.unit
                        ? tunits("propertyRef", {
                            id: String(p.invoice.lease.unit.property_id),
                          })
                        : tc("dash"));
                    const date = p.created_at
                      ? new Date(p.created_at).toLocaleDateString()
                      : tc("dash");
                    const methodLabel = p.method
                      ? translatePaymentMethod(p.method, (k) => tp(k))
                      : tc("dash");
                    return (
                      <tr key={p.id} className="transition-colors hover:bg-loom-hover">
                        <Td className="font-semibold text-loom-text-900">{tenantName}</Td>
                        <Td className="text-loom-text-700">{propName}</Td>
                        <Td className="font-mono font-semibold text-emerald-600">
                          {formatEtb(p.amount)}
                        </Td>
                        <Td>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${methodBadge(p.method)}`}
                          >
                            <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-current" />
                            {methodLabel}
                          </span>
                        </Td>
                        <Td className="font-mono text-[12px]">{p.reference ?? tc("dash")}</Td>
                        <Td className="font-mono text-[12.5px] text-loom-text-500">{date}</Td>
                        <Td>
                          <button
                            type="button"
                            className="rounded-md border border-loom-border bg-loom-surface px-2.5 py-1 text-[12px] font-semibold text-loom-text-700 shadow-loom-xs hover:bg-loom-hover"
                          >
                            {tp("receipt")}
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
                  {tp("noMatch")}
                </p>
              ) : (
                q.data?.items.map((p) => {
                  const tenantName = p.tenant?.name ?? tc("dash");
                  const propName =
                    p.invoice?.lease?.unit?.property?.name ??
                    (p.invoice?.lease?.unit
                      ? tunits("propertyRef", {
                          id: String(p.invoice.lease.unit.property_id),
                        })
                      : tc("dash"));
                  const date = p.created_at
                    ? new Date(p.created_at).toLocaleDateString()
                    : tc("dash");
                  const methodLabel = p.method
                    ? translatePaymentMethod(p.method, (k) => tp(k))
                    : tc("dash");
                  return (
                    <CardRow key={p.id}>
                      <CardField label={tp("tenant")}>
                        <span className="font-semibold text-loom-text-900">{tenantName}</span>
                      </CardField>
                      <CardField label={tp("property")}>{propName}</CardField>
                      <CardField label={tp("amount")}>
                        <span className="font-mono font-semibold text-emerald-600">
                          {formatEtb(p.amount)}
                        </span>
                      </CardField>
                      <CardField label={tp("method")}>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${methodBadge(p.method)}`}
                        >
                          <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-current" />
                          {methodLabel}
                        </span>
                      </CardField>
                      <CardField label={tp("reference")}>
                        <span className="font-mono text-[12px]">{p.reference ?? tc("dash")}</span>
                      </CardField>
                      <CardField label={tp("date")}>
                        <span className="font-mono text-[12.5px] text-loom-text-500">{date}</span>
                      </CardField>
                      <button
                        type="button"
                        className="min-h-11 w-full rounded-md border border-loom-border bg-loom-surface px-3 text-[13px] font-semibold text-loom-text-700 shadow-loom-xs"
                      >
                        {tp("receipt")}
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

"use client";

import { useDashboardModals } from "@/contexts/dashboard-modals-context";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { fetchPaginated } from "@/lib/fetch-paginated";
import {
  fetchPropertyOptions,
  propertyOptionsQueryKey,
} from "@/lib/queries/property-options";
import type { Lease } from "@/types/resources";
import { translateLeaseStatus } from "@/lib/i18n-labels";
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
  leaseStatusBadge,
} from "@/components/dashboard/ListPageUi";

export function LeasesPage() {
  const tl = useTranslations("leases");
  const tq = useTranslations("query");
  const tc = useTranslations("common");
  const tunits = useTranslations("units");
  const tls = useTranslations("leaseStatus");
  const { openModal } = useDashboardModals();
  const leaseTabs = useMemo(
    () => [
      { id: "all", label: tc("all") },
      { id: "active", label: tls("active") },
      { id: "expiring", label: tls("expiring") },
      { id: "terminated", label: tls("terminated") },
    ],
    [tc, tls],
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

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, propertyId, statusTab]);

  const q = useQuery({
    queryKey: ["leases", "list", { page, search: debouncedSearch, propertyId, statusTab }],
    queryFn: () =>
      fetchPaginated<Lease>(
        "/leases",
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
            onClick={() => openModal("new-lease")}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {tl("newLease")}
          </button>
        }
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={tl("searchPlaceholder")}
        />
        <PropertySelect
          value={propertyId}
          onChange={setPropertyId}
          properties={propsQ.data ?? []}
          disabled={propsQ.isLoading}
        />
      </ListPageToolbar>

      <StatusTabs tabs={leaseTabs} active={statusTab} onChange={setStatusTab} />

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
                  <Th>{tl("tenant")}</Th>
                  <Th>{tl("unit")}</Th>
                  <Th>{tl("property")}</Th>
                  <Th>{tl("start")}</Th>
                  <Th>{tl("end")}</Th>
                  <Th>{tl("rent")}</Th>
                  <Th>{tl("status")}</Th>
                  <Th>{tc("actions")}</Th>
                </tr>
              </thead>
              <tbody>
                {q.data?.items.length === 0 ? (
                  <tr>
                    <Td colSpan={8} className="py-12 text-center text-loom-text-400">
                      {tl("noMatch")}
                    </Td>
                  </tr>
                ) : (
                  q.data?.items.map((l) => {
                    const tenantName = l.tenant?.name ?? tc("dash");
                    const unitNo = l.unit?.unit_number ?? tc("dash");
                    const propName =
                      l.unit?.property?.name ??
                      (l.unit
                        ? tunits("propertyRef", { id: String(l.unit.property_id) })
                        : tc("dash"));
                    return (
                      <tr key={l.id} className="transition-colors hover:bg-loom-hover">
                        <Td className="font-semibold text-loom-text-900">{tenantName}</Td>
                        <Td className="font-mono">{unitNo}</Td>
                        <Td className="text-loom-text-700">{propName}</Td>
                        <Td className="font-mono text-[12.5px]">{l.start_date ?? tc("dash")}</Td>
                        <Td className="font-mono text-[12.5px]">{l.end_date ?? tc("dash")}</Td>
                        <Td className="font-mono font-semibold">{formatEtb(l.rent_amount)}</Td>
                        <Td>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${leaseStatusBadge(l.status)}`}
                          >
                            <span className="h-[5px] w-[5px] rounded-full bg-current" />
                            {translateLeaseStatus(l.status, (k) => tls(k))}
                          </span>
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
                  {tl("noMatch")}
                </p>
              ) : (
                q.data?.items.map((l) => {
                  const tenantName = l.tenant?.name ?? tc("dash");
                  const unitNo = l.unit?.unit_number ?? tc("dash");
                  const propName =
                    l.unit?.property?.name ??
                    (l.unit
                      ? tunits("propertyRef", { id: String(l.unit.property_id) })
                      : tc("dash"));
                  return (
                    <CardRow key={l.id}>
                      <CardField label={tl("tenant")}>
                        <span className="font-semibold">{tenantName}</span>
                      </CardField>
                      <CardField label={tl("unit")}>
                        <span className="font-mono">{unitNo}</span>
                      </CardField>
                      <CardField label={tl("property")}>{propName}</CardField>
                      <CardField label={tl("start")}>
                        <span className="font-mono text-[12.5px]">{l.start_date ?? tc("dash")}</span>
                      </CardField>
                      <CardField label={tl("end")}>
                        <span className="font-mono text-[12.5px]">{l.end_date ?? tc("dash")}</span>
                      </CardField>
                      <CardField label={tl("rent")}>
                        <span className="font-mono font-semibold">{formatEtb(l.rent_amount)}</span>
                      </CardField>
                      <CardField label={tl("status")}>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${leaseStatusBadge(l.status)}`}
                        >
                          <span className="h-[5px] w-[5px] rounded-full bg-current" />
                          {translateLeaseStatus(l.status, (k) => tls(k))}
                        </span>
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

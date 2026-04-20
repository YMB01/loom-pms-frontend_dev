"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { fetchPaginated } from "@/lib/fetch-paginated";
import {
  fetchPropertyOptions,
  propertyOptionsQueryKey,
} from "@/lib/queries/property-options";
import type { Unit } from "@/types/resources";
import { translateUnitStatus } from "@/lib/i18n-labels";
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
  unitStatusBadge,
} from "@/components/dashboard/ListPageUi";

export function UnitsPage() {
  const tu = useTranslations("units");
  const tc = useTranslations("common");
  const tq = useTranslations("query");
  const tProp = useTranslations("properties");
  const tUs = useTranslations("unitStatus");
  const unitTabs = useMemo(
    () => [
      { id: "all", label: tc("all") },
      { id: "available", label: tUs("available") },
      { id: "occupied", label: tUs("occupied") },
      { id: "maintenance", label: tUs("maintenance") },
    ],
    [tc, tUs],
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
    queryKey: ["units", "list", { page, search: debouncedSearch, propertyId, statusTab }],
    queryFn: () =>
      fetchPaginated<Unit>(
        "/units",
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
            className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {tu("addUnit")}
          </button>
        }
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={tu("searchPlaceholder")}
        />
        <PropertySelect
          value={propertyId}
          onChange={setPropertyId}
          properties={propsQ.data ?? []}
          disabled={propsQ.isLoading}
        />
      </ListPageToolbar>

      <StatusTabs tabs={unitTabs} active={statusTab} onChange={setStatusTab} />

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
                  <Th>{tu("unitLabel")}</Th>
                  <Th>{tu("property")}</Th>
                  <Th>{tu("type")}</Th>
                  <Th>{tu("floor")}</Th>
                  <Th>{tu("size")}</Th>
                  <Th>{tu("rent")}</Th>
                  <Th>{tu("status")}</Th>
                  <Th>{tc("actions")}</Th>
                </tr>
              </thead>
              <tbody>
                {q.data?.items.length === 0 ? (
                  <tr>
                    <Td colSpan={8} className="py-12 text-center text-loom-text-400">
                      {tu("noMatch")}
                    </Td>
                  </tr>
                ) : (
                  q.data?.items.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-loom-hover">
                      <Td className="font-mono font-semibold text-loom-text-900">{u.unit_number}</Td>
                      <Td className="text-loom-text-700">
                        {u.property?.name ?? tu("propertyRef", { id: String(u.property_id) })}
                      </Td>
                      <Td>{u.type ?? tc("dash")}</Td>
                      <Td className="font-mono">{u.floor ?? tc("dash")}</Td>
                      <Td className="font-mono">
                        {u.size_sqm ? tu("sizeSqm", { sqm: String(u.size_sqm) }) : tc("dash")}
                      </Td>
                      <Td className="font-mono font-semibold text-loom-text-900">
                        {formatEtb(u.rent_amount)}
                      </Td>
                      <Td>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${unitStatusBadge(u.status)}`}
                        >
                          <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-current" />
                          {translateUnitStatus(u.status, (k) => tUs(k))}
                        </span>
                      </Td>
                      <Td>
                        <button
                          type="button"
                          className="rounded-md border border-loom-border bg-loom-surface px-2.5 py-1 text-[12px] font-semibold text-loom-text-700 shadow-loom-xs hover:bg-loom-hover"
                        >
                          {tProp("manage")}
                        </button>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          }
          cards={
            <>
              {q.data?.items.length === 0 ? (
                <p className="py-10 text-center text-sm text-loom-text-400">
                  {tu("noMatch")}
                </p>
              ) : (
                q.data?.items.map((u) => (
                  <CardRow key={u.id}>
                    <div className="font-mono text-xl font-bold text-loom-text-900">{u.unit_number}</div>
                    <CardField label={tu("property")}>
                      {u.property?.name ?? tu("propertyRef", { id: String(u.property_id) })}
                    </CardField>
                    <CardField label={tu("type")}>{u.type ?? tc("dash")}</CardField>
                    <CardField label={tu("floor")}>
                      <span className="font-mono">{u.floor ?? tc("dash")}</span>
                    </CardField>
                    <CardField label={tu("size")}>
                      <span className="font-mono">
                        {u.size_sqm ? tu("sizeSqm", { sqm: String(u.size_sqm) }) : tc("dash")}
                      </span>
                    </CardField>
                    <CardField label={tu("rent")}>
                      <span className="font-mono font-semibold">{formatEtb(u.rent_amount)}</span>
                    </CardField>
                    <CardField label={tu("status")}>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${unitStatusBadge(u.status)}`}
                      >
                        <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-current" />
                        {translateUnitStatus(u.status, (k) => tUs(k))}
                      </span>
                    </CardField>
                    <button
                      type="button"
                      className="min-h-11 w-full rounded-md border border-loom-border bg-loom-surface px-3 text-[13px] font-semibold text-loom-text-700 shadow-loom-xs"
                    >
                      {tProp("manage")}
                    </button>
                  </CardRow>
                ))
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

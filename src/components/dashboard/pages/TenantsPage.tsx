"use client";

import Link from "next/link";
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
import type { Tenant } from "@/types/resources";
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
} from "@/components/dashboard/ListPageUi";

function hue(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return [220, 280, 160, 30, 340, 200][h % 6]!;
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return `${p[0]![0]}${p[p.length - 1]![0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

export function TenantsPage() {
  const tt = useTranslations("tenants");
  const tc = useTranslations("common");
  const tq = useTranslations("query");
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
    queryKey: ["tenants", "list", { page, search: debouncedSearch, propertyId }],
    queryFn: () =>
      fetchPaginated<Tenant>("/tenants", {
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
            onClick={() => openModal("onboard-tenant")}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {tt("onboardTenant")}
          </button>
        }
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={tt("searchPlaceholder")}
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
          <TableSkeleton cols={6} />
        </TableCard>
      ) : (
        <ResponsiveTable
          table={
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th>{tt("tenantName")}</Th>
                  <Th>{tt("email")}</Th>
                  <Th>{tt("phone")}</Th>
                  <Th>{tt("idNumber")}</Th>
                  <Th>{tt("balance")}</Th>
                </tr>
              </thead>
              <tbody>
                {q.data?.items.length === 0 ? (
                  <tr>
                    <Td colSpan={5} className="py-12 text-center text-loom-text-400">
                      {tt("noMatch")}
                    </Td>
                  </tr>
                ) : (
                  q.data?.items.map((t) => (
                    <tr key={t.id} className="transition-colors hover:bg-loom-hover">
                      <Td>
                        <Link
                          href={`/dashboard/tenants/${t.id}`}
                          className="flex items-center gap-2.5 text-loom-text-900 hover:text-loom-blue-600"
                        >
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                            style={{ background: `hsl(${hue(t.name)}, 55%, 46%)` }}
                          >
                            {initials(t.name)}
                          </div>
                          <span className="font-semibold">{t.name}</span>
                        </Link>
                      </Td>
                      <Td>{t.email ?? tc("dash")}</Td>
                      <Td className="font-mono text-[12.5px]">{t.phone ?? tc("dash")}</Td>
                      <Td className="font-mono">{t.id_number ?? tc("dash")}</Td>
                      <Td className="font-mono text-loom-text-400">{tc("dash")}</Td>
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
                  {tt("noMatch")}
                </p>
              ) : (
                q.data?.items.map((t) => (
                  <CardRow key={t.id}>
                    <Link
                      href={`/dashboard/tenants/${t.id}`}
                      className="flex items-center gap-2.5 text-[15px] font-semibold text-loom-text-900 hover:text-loom-blue-600"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                        style={{ background: `hsl(${hue(t.name)}, 55%, 46%)` }}
                      >
                        {initials(t.name)}
                      </div>
                      <span>{t.name}</span>
                    </Link>
                    <CardField label={tt("email")}>{t.email ?? tc("dash")}</CardField>
                    <CardField label={tt("phone")}>
                      <span className="font-mono text-[12.5px]">{t.phone ?? tc("dash")}</span>
                    </CardField>
                    <CardField label={tt("idNumber")}>
                      <span className="font-mono">{t.id_number ?? tc("dash")}</span>
                    </CardField>
                    <CardField label={tt("balance")}>
                      <span className="font-mono text-loom-text-400">{tc("dash")}</span>
                    </CardField>
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

"use client";

import { useDashboardModals } from "@/contexts/dashboard-modals-context";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { fetchPaginated } from "@/lib/fetch-paginated";
import type { Property } from "@/types/resources";
import {
  CardField,
  CardRow,
  ListPageToolbar,
  PaginationBar,
  QueryError,
  ResponsiveTable,
  SearchInput,
  TableCard,
  TableSkeleton,
  Td,
  Th,
  typeBadgeClass,
} from "@/components/dashboard/ListPageUi";

const queryKeyBase = ["properties", "list"] as const;

export function PropertiesPage() {
  const { openModal } = useDashboardModals();
  const tp = useTranslations("properties");
  const tc = useTranslations("common");
  const tq = useTranslations("query");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const q = useQuery({
    queryKey: [...queryKeyBase, { page, search: debouncedSearch }],
    queryFn: () =>
      fetchPaginated<Property>("/properties", {
        page,
        per_page: 15,
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
    <div className="animate-loom-page-in space-y-0">
      <ListPageToolbar
        actions={
          <button
            type="button"
            onClick={() => openModal("add-property")}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {tp("addProperty")}
          </button>
        }
      >
        <SearchInput value={search} onChange={setSearch} placeholder={tp("searchPlaceholder")} />
      </ListPageToolbar>

      {q.isLoading ? (
        <TableCard>
          <TableSkeleton cols={7} />
        </TableCard>
      ) : (
        <ResponsiveTable
          cardsWrapperClassName="grid grid-cols-1 gap-4 p-3 md:grid-cols-2 xl:grid-cols-3"
          table={
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th>{tp("property")}</Th>
                  <Th>{tp("type")}</Th>
                  <Th>{tp("location")}</Th>
                  <Th>{tp("totalUnits")}</Th>
                  <Th>{tp("occupancy")}</Th>
                  <Th>{tp("rentRange")}</Th>
                  <Th>{tc("actions")}</Th>
                </tr>
              </thead>
              <tbody>
                {q.data?.items.length === 0 ? (
                  <tr>
                    <Td className="py-12 text-center text-loom-text-400" colSpan={7}>
                      {tp("noMatch")}
                    </Td>
                  </tr>
                ) : (
                  q.data?.items.map((p) => {
                    const loc =
                      [p.city, p.country].filter(Boolean).join(", ") || p.address || tc("dash");
                    return (
                      <tr key={p.id} className="transition-colors hover:bg-loom-hover">
                        <Td className="!text-loom-text-900">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-loom-blue-100">
                              <svg
                                className="h-4 w-4 stroke-loom-blue-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                              </svg>
                            </div>
                            <span className="text-[13.5px] font-semibold">{p.name}</span>
                          </div>
                        </Td>
                        <Td>
                          {p.type ? (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${typeBadgeClass(p.type)}`}
                            >
                              <span className="h-[5px] w-[5px] rounded-full bg-current" />
                              {p.type}
                            </span>
                          ) : (
                            tc("dash")
                          )}
                        </Td>
                        <Td className="text-loom-text-700">{loc}</Td>
                        <Td>
                          <span className="font-mono font-semibold text-loom-text-900">
                            {p.total_units}
                          </span>
                        </Td>
                        <Td className="min-w-[130px]">
                          <span className="text-xs text-loom-text-400">{tc("dash")}</span>
                        </Td>
                        <Td className="font-mono text-[12.5px] text-loom-text-700">{tc("dash")}</Td>
                        <Td>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              className="rounded-md border border-loom-blue-600 bg-loom-blue-600 px-2.5 py-1 text-[12px] font-semibold text-white shadow-loom-xs hover:border-[#1d4ed8] hover:bg-[#1d4ed8]"
                            >
                              {tp("manage")}
                            </button>
                            <button
                              type="button"
                              className="rounded-md border-0 bg-transparent px-2.5 py-1 text-[12px] font-semibold text-loom-text-500 hover:bg-loom-hover"
                            >
                              {tc("edit")}
                            </button>
                          </div>
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
                <p className="col-span-full py-10 text-center text-sm text-loom-text-400">
                  {tp("noMatch")}
                </p>
              ) : (
                q.data?.items.map((p) => {
                  const loc =
                    [p.city, p.country].filter(Boolean).join(", ") || p.address || tc("dash");
                  return (
                    <CardRow key={p.id}>
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-loom-blue-100">
                          <svg
                            className="h-5 w-5 stroke-loom-blue-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        </div>
                        <span className="text-[15px] font-semibold text-loom-text-900">{p.name}</span>
                      </div>
                      <CardField label={tp("type")}>
                        {p.type ? (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${typeBadgeClass(p.type)}`}
                          >
                            <span className="h-[5px] w-[5px] rounded-full bg-current" />
                            {p.type}
                          </span>
                        ) : (
                          tc("dash")
                        )}
                      </CardField>
                      <CardField label={tp("location")}>{loc}</CardField>
                      <CardField label={tp("totalUnits")}>
                        <span className="font-mono font-semibold">{p.total_units}</span>
                      </CardField>
                      <CardField label={tp("occupancy")}>
                        <span className="text-xs text-loom-text-400">{tc("dash")}</span>
                      </CardField>
                      <CardField label={tp("rentRange")}>
                        <span className="font-mono text-[12.5px] text-loom-text-700">{tc("dash")}</span>
                      </CardField>
                      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                        <button
                          type="button"
                          className="min-h-11 flex-1 rounded-md border border-loom-blue-600 bg-loom-blue-600 px-3 text-[13px] font-semibold text-white shadow-loom-xs"
                        >
                          {tp("manage")}
                        </button>
                        <button
                          type="button"
                          className="min-h-11 flex-1 rounded-md border border-loom-border bg-loom-surface px-3 text-[13px] font-semibold text-loom-text-700 shadow-loom-xs"
                        >
                          {tc("edit")}
                        </button>
                      </div>
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

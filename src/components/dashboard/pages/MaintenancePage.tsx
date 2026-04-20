"use client";

import { useDashboardModals } from "@/contexts/dashboard-modals-context";
import { useTheme } from "@/contexts/theme-context";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { MaintenanceStatusBarChart } from "@/components/dashboard/charts/MaintenanceStatusBarChart";
import { fetchPaginated } from "@/lib/fetch-paginated";
import { api } from "@/lib/api";
import {
  fetchPropertyOptions,
  propertyOptionsQueryKey,
} from "@/lib/queries/property-options";
import type { MaintenanceStatsSummary } from "@/types/dashboard";
import type { ApiEnvelope } from "@/types/api";
import type { MaintenanceRequest } from "@/types/resources";
import { translateMaintStatus, translatePriority } from "@/lib/i18n-labels";
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
  maintStatusBadge,
} from "@/components/dashboard/ListPageUi";

type ChartBarFilter = "open" | "in_progress" | "resolved" | "urgent" | null;

export function MaintenancePage() {
  const { isDark } = useTheme();
  const tm = useTranslations("maintenance");
  const tq = useTranslations("query");
  const tc = useTranslations("common");
  const tunits = useTranslations("units");
  const tmaint = useTranslations("maintStatus");
  const tpri = useTranslations("priority");
  const { openModal } = useDashboardModals();
  const maintTabs = useMemo(
    () => [
      { id: "all", label: tc("all") },
      { id: "open", label: tmaint("open") },
      { id: "in_progress", label: tmaint("in_progress") },
      { id: "resolved", label: tmaint("resolved") },
    ],
    [tc, tmaint],
  );
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [propertyId, setPropertyId] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [chartBar, setChartBar] = useState<ChartBarFilter>(null);
  const [page, setPage] = useState(1);

  const propsQ = useQuery({
    queryKey: propertyOptionsQueryKey,
    queryFn: fetchPropertyOptions,
    staleTime: 60_000,
  });

  const statsQ = useQuery({
    queryKey: ["maintenance", "stats-summary"],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<MaintenanceStatsSummary>>(
        "/maintenance/stats-summary",
      );
      if (!data.success || data.data == null) {
        throw new Error(data.message || "Request failed");
      }
      return data.data;
    },
    staleTime: 30_000,
  });

  const listStatus = useMemo(() => {
    if (chartBar === "urgent") return "all";
    if (chartBar) return chartBar;
    return statusTab;
  }, [chartBar, statusTab]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, propertyId, statusTab, chartBar]);

  const q = useQuery({
    queryKey: [
      "maintenance",
      "list",
      { page, search: debouncedSearch, propertyId, statusTab, chartBar },
    ],
    queryFn: () =>
      fetchPaginated<MaintenanceRequest>(
        "/maintenance",
        {
          page,
          per_page: 15,
          property_id: propertyId ? Number(propertyId) : undefined,
          status: listStatus,
          priority: chartBar === "urgent" ? "urgent" : undefined,
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
            onClick={() => openModal("log-maintenance")}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8]"
          >
            {tm("logRequest")}
          </button>
        }
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={tm("searchPlaceholder")}
        />
        <PropertySelect
          value={propertyId}
          onChange={setPropertyId}
          properties={propsQ.data ?? []}
          disabled={propsQ.isLoading}
        />
      </ListPageToolbar>

      <div className="mb-4 rounded-2xl border border-loom-border bg-loom-surface p-4 shadow-loom-xs dark:border-loom-border">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[14px] font-semibold text-loom-text-900 dark:text-loom-text-100">
            {tm("statusOverviewTitle")}
          </h2>
          {chartBar ? (
            <button
              type="button"
              onClick={() => setChartBar(null)}
              className="text-[12.5px] font-semibold text-loom-blue-600 hover:underline"
            >
              {tm("clearChartFilter")}
            </button>
          ) : null}
        </div>
        <p className="mb-3 text-[12px] text-loom-text-500">{tm("chartBarHint")}</p>
        {statsQ.isLoading ? (
          <div className="h-[200px] w-full animate-pulse rounded-lg bg-loom-bg-2 dark:bg-loom-hover" />
        ) : (
          <MaintenanceStatusBarChart
            stats={statsQ.data}
            isDark={isDark}
            active={chartBar}
            onSelect={setChartBar}
          />
        )}
      </div>

      <StatusTabs tabs={maintTabs} active={statusTab} onChange={setStatusTab} />

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
                  <Th>{tm("title")}</Th>
                  <Th>{tm("property")}</Th>
                  <Th>{tm("unit")}</Th>
                  <Th>{tm("priority")}</Th>
                  <Th>{tm("status")}</Th>
                  <Th>{tm("opened")}</Th>
                  <Th>{tc("actions")}</Th>
                </tr>
              </thead>
              <tbody>
                {q.data?.items.length === 0 ? (
                  <tr>
                    <Td colSpan={7} className="py-12 text-center text-loom-text-400">
                      {tm("noMatch")}
                    </Td>
                  </tr>
                ) : (
                  q.data?.items.map((m) => {
                    const opened = m.created_at
                      ? new Date(m.created_at).toLocaleDateString()
                      : tc("dash");
                    return (
                      <tr key={m.id} className="transition-colors hover:bg-loom-hover">
                        <Td className="font-semibold text-loom-text-900">{m.title}</Td>
                        <Td className="text-loom-text-700">
                          {m.property?.name ??
                            tunits("propertyRef", { id: String(m.property_id) })}
                        </Td>
                        <Td className="font-mono text-[12.5px]">{m.unit}</Td>
                        <Td className="text-loom-text-600">
                          {translatePriority(m.priority, (k) => tpri(k))}
                        </Td>
                        <Td>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${maintStatusBadge(m.status)}`}
                          >
                            <span className="h-[5px] w-[5px] rounded-full bg-current" />
                            {translateMaintStatus(m.status, (k) => tmaint(k))}
                          </span>
                        </Td>
                        <Td className="font-mono text-[12.5px] text-loom-text-500">{opened}</Td>
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
                  {tm("noMatch")}
                </p>
              ) : (
                q.data?.items.map((m) => {
                  const opened = m.created_at
                    ? new Date(m.created_at).toLocaleDateString()
                    : tc("dash");
                  return (
                    <CardRow key={m.id}>
                      <div className="text-[15px] font-semibold text-loom-text-900">{m.title}</div>
                      <CardField label={tm("property")}>
                        {m.property?.name ??
                          tunits("propertyRef", { id: String(m.property_id) })}
                      </CardField>
                      <CardField label={tm("unit")}>
                        <span className="font-mono text-[12.5px]">{m.unit}</span>
                      </CardField>
                      <CardField label={tm("priority")}>
                        <span className="text-loom-text-600">
                          {translatePriority(m.priority, (k) => tpri(k))}
                        </span>
                      </CardField>
                      <CardField label={tm("status")}>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${maintStatusBadge(m.status)}`}
                        >
                          <span className="h-[5px] w-[5px] rounded-full bg-current" />
                          {translateMaintStatus(m.status, (k) => tmaint(k))}
                        </span>
                      </CardField>
                      <CardField label={tm("opened")}>
                        <span className="font-mono text-[12.5px] text-loom-text-500">{opened}</span>
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

"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { useChartPalette } from "@/lib/chart-theme";
import type { InvoiceChartSummary } from "@/types/dashboard";

type StatKey = "pending" | "overdue" | "paid" | "partial";

const STROKES: Record<StatKey, string> = {
  pending: "#3b82f6",
  overdue: "#ef4444",
  paid: "#10b981",
  partial: "#f59e0b",
};

type Props = {
  summary: InvoiceChartSummary | undefined;
  isLoading: boolean;
  isDark: boolean;
  activeTab: string;
  onSelect: (tab: string) => void;
  labels: Record<StatKey, string>;
  pipelineTitle: string;
  hint: string;
  clearFilter: string;
  totalLabel: string;
  formatAmount: (n: number) => string;
};

export function InvoiceStatusSparklineCards({
  summary,
  isLoading,
  isDark,
  activeTab,
  onSelect,
  labels,
  pipelineTitle,
  hint,
  clearFilter,
  totalLabel,
  formatAmount,
}: Props) {
  const p = useChartPalette(isDark);
  const keys: StatKey[] = ["pending", "overdue", "paid", "partial"];

  const chartFilter =
    keys.includes(activeTab as StatKey) ? (activeTab as StatKey) : null;

  return (
    <div className="mb-4 rounded-2xl border border-loom-border bg-loom-surface p-4 shadow-loom-xs dark:border-loom-border">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[14px] font-semibold text-loom-text-900 dark:text-loom-text-100">
          {pipelineTitle}
        </h2>
        {chartFilter ? (
          <button
            type="button"
            onClick={() => onSelect("all")}
            className="text-[12.5px] font-semibold text-loom-blue-600 hover:underline"
          >
            {clearFilter}
          </button>
        ) : null}
      </div>
      <p className="mb-3 text-[12px] text-loom-text-500">{hint}</p>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {keys.map((k) => (
            <div
              key={k}
              className="h-[120px] animate-pulse rounded-xl bg-loom-bg-2 dark:bg-loom-hover"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {keys.map((key) => {
            const row = summary?.[key];
            const spark =
              row?.trend?.map((v, i) => ({ i, v: Number(v ?? 0) })) ?? [];
            const active = chartFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(active ? "all" : key)}
                className={`rounded-xl border p-3 text-left transition-shadow ${
                  active
                    ? "border-loom-blue-500 bg-loom-blue-50/80 shadow-md ring-2 ring-loom-blue-400 ring-offset-2 ring-offset-loom-surface dark:bg-loom-hover/80 dark:ring-offset-[#0f1419]"
                    : "border-loom-border bg-loom-surface-2/60 hover:border-loom-border-2 dark:hover:bg-loom-hover/50"
                } `}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-loom-text-500">
                  {labels[key]}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-loom-text-900 dark:text-loom-text-100">
                  {row?.count ?? 0}
                </p>
                <p className="text-[12px] text-loom-text-600 dark:text-loom-text-400">
                  {totalLabel} {formatAmount(row?.amount ?? 0)}
                </p>
                <div className="mt-2 h-[52px] w-full">
                  {spark.length === 0 ? (
                    <p className="pt-3 text-[11px] text-loom-text-400">—</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={spark} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                        <Tooltip
                          contentStyle={{
                            background: p.tooltipBg,
                            border: `1px solid ${p.tooltipBorder}`,
                            borderRadius: 8,
                          }}
                          labelStyle={{ color: p.tooltipLabel }}
                          formatter={(v) => [String(v), labels[key]]}
                          labelFormatter={() => ""}
                        />
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke={STROKES[key]}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive
                          animationDuration={900}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

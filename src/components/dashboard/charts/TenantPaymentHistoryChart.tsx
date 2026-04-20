"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartPalette } from "@/lib/chart-theme";
import type { TenantPaymentHistoryChartResponse } from "@/types/dashboard";

type Props = {
  data: TenantPaymentHistoryChartResponse | undefined;
  isDark: boolean;
  isLoading: boolean;
  formatAmount: (n: number) => string;
  labels: {
    paid: string;
    expected: string;
  };
  empty: string;
};

export function TenantPaymentHistoryChart({
  data,
  isDark,
  isLoading,
  formatAmount,
  labels,
  empty,
}: Props) {
  const p = useChartPalette(isDark);
  const rows =
    data?.months?.map((m) => ({
      label: m.label,
      paid: m.paid,
      expected: m.expected,
      fill: m.missed ? "#ef4444" : "#22c55e",
    })) ?? [];

  if (isLoading) {
    return (
      <div className="h-[280px] w-full animate-pulse rounded-xl bg-loom-bg-2 dark:bg-loom-hover" />
    );
  }

  if (!rows.length) {
    return (
      <p className="rounded-xl border border-loom-border bg-loom-surface-2 px-4 py-8 text-center text-sm text-loom-text-500">
        {empty}
      </p>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: p.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: p.tick, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatAmount(Number(v ?? 0))}
            width={72}
          />
          <Tooltip
            contentStyle={{
              background: p.tooltipBg,
              border: `1px solid ${p.tooltipBorder}`,
              borderRadius: 10,
            }}
            labelStyle={{ color: p.tooltipLabel }}
            formatter={(value, name) => [
              formatAmount(Number(value ?? 0)),
              name === "paid"
                ? labels.paid
                : name === "expected"
                  ? labels.expected
                  : String(name),
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: p.legend }}
            formatter={(value) =>
              value === "paid"
                ? labels.paid
                : value === "expected"
                  ? labels.expected
                  : value
            }
          />
          <Bar
            dataKey="paid"
            name="paid"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          >
            {rows.map((entry, i) => (
              <Cell key={entry.label + String(i)} fill={entry.fill} />
            ))}
          </Bar>
          <Line
            type="monotone"
            dataKey="expected"
            name="expected"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: "#3b82f6" }}
            isAnimationActive
            animationDuration={900}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

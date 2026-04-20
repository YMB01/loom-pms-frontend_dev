"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenueChartPoint } from "@/types/dashboard";
import { useChartPalette, formatChartCurrencyAxis } from "@/lib/chart-theme";
import { useTranslations } from "next-intl";

function formatEtb(n: number): string {
  return `ETB ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

type Props = {
  data: RevenueChartPoint[];
  isDark: boolean;
};

export function DashboardRevenueAreaChart({ data, isDark }: Props) {
  const td = useTranslations("dashboard");
  const p = useChartPalette(isDark);
  const chartData = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        label: row.label ?? row.month,
        expected: row.expected ?? row.amount ?? 0,
        collected: row.collected ?? row.amount ?? 0,
      })),
    [data],
  );

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-loom-border bg-loom-bg text-sm text-loom-text-500">
        {td("chartNoRevenueData")}
      </div>
    );
  }

  return (
    <div className="h-[min(360px,55vh)] w-full min-w-0 sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fillExpected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: p.tick, fontSize: p.tickFont }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fill: p.tick, fontSize: p.tickFont }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatChartCurrencyAxis(Number(v))}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: p.tooltipBg,
              border: `1px solid ${p.tooltipBorder}`,
              borderRadius: 10,
              color: p.tooltipLabel,
              fontSize: 12,
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            formatter={(value, name) => [
              formatEtb(Number(value ?? 0)),
              name === "expected" ? td("expectedRevenue") : td("collectedRevenue"),
            ]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 8, fontSize: 12, color: p.legend }}
            formatter={(value) =>
              value === "expected" ? td("expectedRevenue") : td("collectedRevenue")
            }
          />
          <Area
            type="monotone"
            dataKey="expected"
            name="expected"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#fillExpected)"
            dot={{ r: 2, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
            isAnimationActive
            animationDuration={1400}
          />
          <Area
            type="monotone"
            dataKey="collected"
            name="collected"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#fillCollected)"
            dot={{ r: 2, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
            isAnimationActive
            animationDuration={1400}
          />
          <Brush
            dataKey="label"
            height={22}
            stroke={isDark ? "#475569" : "#94a3b8"}
            travellerWidth={8}
            tickFormatter={() => ""}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

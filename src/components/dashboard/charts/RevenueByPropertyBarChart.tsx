"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PropertyRevenueRow } from "@/types/dashboard";
import { useChartPalette, formatChartCurrencyAxis } from "@/lib/chart-theme";
import { useTranslations } from "next-intl";

function typeColor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("commercial")) return "#a855f7";
  if (t.includes("mixed")) return "#22c55e";
  return "#3b82f6";
}

function formatEtb(n: number): string {
  return `ETB ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

type Props = {
  rows: PropertyRevenueRow[];
  isDark: boolean;
};

export function RevenueByPropertyBarChart({ rows, isDark }: Props) {
  const td = useTranslations("dashboard");
  const p = useChartPalette(isDark);
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.revenue - a.revenue).slice(0, 15),
    [rows],
  );

  const data = useMemo(
    () =>
      sorted.map((r) => ({
        name:
          r.name.length > 22
            ? `${r.name.slice(0, 20)}…`
            : r.name,
        fullName: r.name,
        revenue: r.revenue,
        type: r.type,
        fill: typeColor(r.type || ""),
      })),
    [sorted],
  );

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-loom-border bg-loom-bg text-sm text-loom-text-500">
        {td("chartEmpty")}
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full min-w-0 sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 28, left: 4, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={p.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: p.tick, fontSize: p.tickFont }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatChartCurrencyAxis(Number(v))}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={108}
            tick={{ fill: p.tick, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => formatEtb(Number(v ?? 0))}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullName ?? ""
            }
            contentStyle={{
              background: p.tooltipBg,
              border: `1px solid ${p.tooltipBorder}`,
              borderRadius: 10,
              fontSize: 12,
            }}
          />
          <Bar dataKey="revenue" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={1200}>
            {data.map((entry, i) => (
              <Cell key={`c-${entry.name}-${i}`} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="revenue"
              position="right"
              formatter={(label) => formatEtb(Number(label ?? 0))}
              style={{ fill: p.tick, fontSize: 10, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartPalette } from "@/lib/chart-theme";
import type { SuperAdminMrrStackedMonth } from "@/types/super-admin";

type Props = {
  data: SuperAdminMrrStackedMonth[];
  isDark: boolean;
  isLoading: boolean;
  formatUsd: (n: number) => string;
  labels: {
    free: string;
    starter: string;
    business: string;
    enterprise: string;
    total: string;
    empty: string;
  };
};

const FILLS = {
  free: "#94a3b8",
  starter: "#3b82f6",
  business: "#10b981",
  enterprise: "#8b5cf6",
};

export function SuperAdminMrrStackedAreaChart({
  data,
  isDark,
  isLoading,
  formatUsd,
  labels,
}: Props) {
  const p = useChartPalette(isDark);
  const totalStroke = isDark ? "#f8fafc" : "#0f172a";

  if (isLoading) {
    return (
      <div className="h-80 w-full animate-pulse rounded-xl bg-loom-bg-2 dark:bg-loom-hover" />
    );
  }

  if (!data.length) {
    return (
      <p className="text-sm text-loom-text-500">{labels.empty}</p>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
          <XAxis
            dataKey="short_label"
            tick={{ fill: p.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: p.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${Number(v ?? 0)}`}
            width={56}
          />
          <Tooltip
            contentStyle={{
              background: p.tooltipBg,
              border: `1px solid ${p.tooltipBorder}`,
              borderRadius: 10,
            }}
            labelStyle={{ color: p.tooltipLabel }}
            formatter={(value, name) => [
              formatUsd(Number(value ?? 0)),
              typeof name === "string" ? name : String(name),
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: p.legend }}
            formatter={(value) => value}
          />
          <Area
            type="monotone"
            dataKey="free"
            name={labels.free}
            stackId="1"
            stroke={FILLS.free}
            fill={FILLS.free}
            fillOpacity={0.85}
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="starter"
            name={labels.starter}
            stackId="1"
            stroke={FILLS.starter}
            fill={FILLS.starter}
            fillOpacity={0.9}
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="business"
            name={labels.business}
            stackId="1"
            stroke={FILLS.business}
            fill={FILLS.business}
            fillOpacity={0.9}
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="enterprise"
            name={labels.enterprise}
            stackId="1"
            stroke={FILLS.enterprise}
            fill={FILLS.enterprise}
            fillOpacity={0.85}
            animationDuration={1000}
          />
          <Line
            type="monotone"
            dataKey="total"
            name={labels.total}
            stroke={totalStroke}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive
            animationDuration={900}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

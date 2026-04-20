"use client";

import {
  Bar,
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
import type { SuperAdminCompanyGrowthMonth } from "@/types/super-admin";

type Props = {
  data: SuperAdminCompanyGrowthMonth[];
  isDark: boolean;
  isLoading: boolean;
  labels: {
    newSignups: string;
    cumulative: string;
    empty: string;
  };
};

export function SuperAdminCompanyGrowthChart({
  data,
  isDark,
  isLoading,
  labels,
}: Props) {
  const p = useChartPalette(isDark);

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
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
          <XAxis
            dataKey="short_label"
            tick={{ fill: p.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: p.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: p.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: p.tooltipBg,
              border: `1px solid ${p.tooltipBorder}`,
              borderRadius: 10,
            }}
            labelStyle={{ color: p.tooltipLabel }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: p.legend }}
          />
          <Bar
            yAxisId="right"
            dataKey="new_signups"
            name={labels.newSignups}
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
            maxBarSize={36}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="cumulative_companies"
            name={labels.cumulative}
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#10b981" }}
            animationDuration={900}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

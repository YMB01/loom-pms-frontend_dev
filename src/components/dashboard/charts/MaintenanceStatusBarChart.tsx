"use client";

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
import { useChartPalette } from "@/lib/chart-theme";
import { useTranslations } from "next-intl";
import type { MaintenanceStatsSummary } from "@/types/dashboard";

const BAR_COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444"];
type FilterKey = "open" | "in_progress" | "resolved" | "urgent";

type Props = {
  stats: MaintenanceStatsSummary | undefined;
  isDark: boolean;
  active: FilterKey | null;
  onSelect: (key: FilterKey | null) => void;
};

export function MaintenanceStatusBarChart({ stats, isDark, active, onSelect }: Props) {
  const tm = useTranslations("maintStatus");
  const tq = useTranslations("priority");
  const p = useChartPalette(isDark);

  const data = [
    { key: "open" as const, label: tm("open"), count: stats?.open ?? 0 },
    { key: "in_progress" as const, label: tm("in_progress"), count: stats?.in_progress ?? 0 },
    { key: "resolved" as const, label: tm("resolved"), count: stats?.resolved ?? 0 },
    { key: "urgent" as const, label: tq("urgent"), count: stats?.urgent ?? 0 },
  ];

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: p.tick, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis allowDecimals={false} tick={{ fill: p.tick, fontSize: 10 }} width={32} />
          <Tooltip
            formatter={(v) => [v, ""]}
            contentStyle={{
              background: p.tooltipBg,
              border: `1px solid ${p.tooltipBorder}`,
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
            animationDuration={1000}
            cursor="pointer"
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.key}
                fill={BAR_COLORS[i % BAR_COLORS.length]}
                opacity={active && active !== entry.key ? 0.35 : 1}
                stroke={active === entry.key ? "#fff" : "none"}
                strokeWidth={active === entry.key ? 2 : 0}
                cursor="pointer"
                onClick={() => onSelect(active === entry.key ? null : entry.key)}
              />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              formatter={(v) => String(v ?? "")}
              style={{ fill: p.tick, fontSize: 11, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-[10px] text-loom-text-500">
        Click a bar to filter the list
      </p>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { PaymentMethodSlice } from "@/types/dashboard";
import { translatePaymentMethod } from "@/lib/i18n-labels";
import { useChartPalette } from "@/lib/chart-theme";
import { useTranslations } from "next-intl";

function methodColor(method: string): string {
  const m = method.toLowerCase();
  if (m.includes("telebirr")) return "#06b6d4";
  if (m.includes("cbe")) return "#3b82f6";
  if (m === "cash" || m.includes("cash")) return "#94a3b8";
  if (m.includes("bank") || m.includes("transfer")) return "#a855f7";
  if (m.includes("card")) return "#22c55e";
  return "#64748b";
}

type Props = {
  slices: PaymentMethodSlice[];
  isDark: boolean;
};

export function PaymentMethodsPieChart({ slices, isDark }: Props) {
  const tp = useTranslations("payments");
  const p = useChartPalette(isDark);
  const data = useMemo(
    () =>
      slices.map((s) => ({
        name: translatePaymentMethod(s.method, (k) => tp(k)),
        raw: s.method,
        value: s.amount,
        percent: s.percent,
        fill: methodColor(s.method),
      })),
    [slices, tp],
  );

  const td = useTranslations("dashboard");

  if (data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-loom-border bg-loom-bg text-sm text-loom-text-500">
        {td("chartEmpty")}
      </div>
    );
  }

  const RADIAN = Math.PI / 180;
  const renderLabel = (props: PieLabelRenderProps) => {
    const cx = Number(props.cx ?? 0);
    const cy = Number(props.cy ?? 0);
    const midAngle = Number(props.midAngle ?? 0);
    const innerRadius = Number(props.innerRadius ?? 0);
    const outerRadius = Number(props.outerRadius ?? 0);
    const percent = Number(props.percent ?? 0);
    if (!percent || percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill={isDark ? "#e2e8f0" : "#1e293b"}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="46%"
            outerRadius={88}
            labelLine={false}
            label={renderLabel}
            isAnimationActive
            animationDuration={1200}
          >
            {data.map((e, i) => (
              <Cell key={`${e.raw}-${i}`} fill={e.fill} stroke={isDark ? "#0f1419" : "#fff"} strokeWidth={1} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, _n, item) => {
              const pct = (item as { payload?: { percent?: number } })?.payload?.percent;
              return [`ETB ${Number(v ?? 0).toLocaleString()}${pct != null ? ` (${pct}%)` : ""}`, "Amount"];
            }}
            contentStyle={{
              background: p.tooltipBg,
              border: `1px solid ${p.tooltipBorder}`,
              borderRadius: 10,
              fontSize: 12,
            }}
          />
          <Legend
            verticalAlign="bottom"
            formatter={(value, entry) => {
              const item = entry.payload as { percent?: number } | undefined;
              const pct = item?.percent;
              return `${value}${pct != null ? ` (${pct}%)` : ""}`;
            }}
            wrapperStyle={{ fontSize: 11, color: p.legend }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

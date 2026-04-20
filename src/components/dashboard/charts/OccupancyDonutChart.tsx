"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslations } from "next-intl";
import { useChartPalette } from "@/lib/chart-theme";

const COLORS = {
  occupied: "#3b82f6",
  vacant: "#e2e8f0",
  maintenance: "#f59e0b",
};

type Props = {
  occupied: number;
  vacant: number;
  maintenance: number;
  occupancyRate: number;
  totalUnits: number;
  isDark: boolean;
};

export function OccupancyDonutChart({
  occupied,
  vacant,
  maintenance,
  occupancyRate,
  totalUnits,
  isDark,
}: Props) {
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const p = useChartPalette(isDark);
  const data = [
    { key: "occupied", name: td("occupied"), value: occupied, fill: COLORS.occupied },
    { key: "vacant", name: td("vacant"), value: vacant, fill: COLORS.vacant },
    {
      key: "maintenance",
      name: td("pieMaintenance"),
      value: maintenance,
      fill: COLORS.maintenance,
    },
  ].filter((d) => d.value > 0);

  const pieData = data.length > 0 ? data : [{ key: "empty", name: td("chartEmpty"), value: 1, fill: "#cbd5e1" }];
  const empty = totalUnits === 0;

  return (
    <div className="w-full">
      <div className="relative mx-auto h-[200px] w-[200px] max-w-full sm:h-[220px] sm:w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive
              animationDuration={1200}
            >
              {pieData.map((e, i) => (
                <Cell key={`${e.key}-${i}`} fill={e.fill} stroke={isDark ? "#0f1419" : "#fff"} strokeWidth={1} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, name) => [`${Number(v ?? 0)} ${tc("units")}`, String(name)]}
              contentStyle={{
                background: p.tooltipBg,
                border: `1px solid ${p.tooltipBorder}`,
                borderRadius: 10,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono text-3xl font-bold tabular-nums text-loom-text-900">
            {empty ? "—" : `${occupancyRate}%`}
          </div>
          <div className="mt-1 max-w-[120px] text-center text-[10px] font-medium leading-tight text-loom-text-500">
            {td("occupancyRateTitle")}
          </div>
        </div>
      </div>
      {!empty ? (
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-loom-text-600">
          {data.map((d) => {
            const pct =
              totalUnits > 0 ? Math.round((d.value / totalUnits) * 1000) / 10 : 0;
            return (
              <div key={d.key} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                <span>
                  {d.name}: {d.value} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-center text-xs text-loom-text-500">{td("chartEmpty")}</p>
      )}
    </div>
  );
}

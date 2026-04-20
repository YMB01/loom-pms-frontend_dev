"use client";

export function useChartPalette(isDark: boolean) {
  return {
    grid: isDark ? "#2a3444" : "#e2e8f0",
    tick: isDark ? "#94a3b8" : "#64748b",
    tickFont: 11,
    tooltipBg: isDark ? "#0f1419" : "#ffffff",
    tooltipBorder: isDark ? "#334155" : "#e2e8f0",
    tooltipLabel: isDark ? "#f8fafc" : "#0f172a",
    cursor: isDark ? "#334155" : "#cbd5e1",
    legend: isDark ? "#cbd5e1" : "#475569",
  };
}

export function formatChartCurrencyAxis(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return `${Math.round(n)}`;
}

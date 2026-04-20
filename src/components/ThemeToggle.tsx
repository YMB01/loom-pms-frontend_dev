"use client";

import { useTheme } from "@/contexts/theme-context";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-loom-border bg-loom-surface text-lg text-loom-text-700 shadow-loom-xs transition-colors hover:bg-loom-hover md:min-h-9 md:min-w-9"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span aria-hidden>{isDark ? "☀️" : "🌙"}</span>
    </button>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import { THEME_STORAGE_KEY } from "@/lib/theme-init-script";

const STORAGE_KEY = THEME_STORAGE_KEY;

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function subscribe(onStoreChange: () => void) {
  window.addEventListener("loom-theme-change", onStoreChange);
  return () => window.removeEventListener("loom-theme-change", onStoreChange);
}

function getSnapshot(): boolean {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot(): boolean {
  return false;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((mode: ThemeMode) => {
    const dark = mode === "dark";
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(STORAGE_KEY, mode);
    window.dispatchEvent(new Event("loom-theme-change"));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: isDark ? "dark" : "light",
      isDark,
      setTheme,
      toggleTheme,
    }),
    [isDark, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

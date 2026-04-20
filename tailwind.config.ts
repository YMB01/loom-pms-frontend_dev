import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-plus-jakarta)",
          "Plus Jakarta Sans",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-dm-mono)", "DM Mono", "ui-monospace", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        loom: {
          page: "var(--loom-page-bg)",
          sidebar: "var(--loom-sidebar-bg)",
          topbar: "var(--loom-topbar-bg)",
          border: "var(--loom-border)",
          "border-2": "var(--loom-border-2)",
          bg: "var(--loom-bg)",
          "bg-2": "var(--loom-bg-2)",
          surface: "var(--loom-surface)",
          "surface-2": "var(--loom-surface-2)",
          hover: "var(--loom-hover)",
          input: "var(--loom-input-bg)",
          "text-900": "var(--loom-text-900)",
          "text-800": "var(--loom-text-800)",
          "text-700": "var(--loom-text-700)",
          "text-500": "var(--loom-text-500)",
          "text-600": "var(--loom-text-600)",
          "text-400": "var(--loom-text-400)",
          "text-300": "var(--loom-text-300)",
          blue: {
            50: "var(--loom-blue-50)",
            100: "var(--loom-blue-100)",
            500: "#3b82f6",
            600: "#2563eb",
          },
          red: {
            500: "#ef4444",
            100: "var(--loom-red-100)",
            600: "#dc2626",
          },
          amber: {
            500: "#f59e0b",
            100: "var(--loom-amber-100)",
            600: "#d97706",
          },
          green: {
            500: "#10b981",
            600: "#059669",
          },
        },
      },
      boxShadow: {
        "loom-xs": "var(--shadow-loom-xs)",
        "loom-sm": "var(--shadow-loom-sm)",
        "loom-xl": "var(--shadow-loom-xl)",
      },
      keyframes: {
        "loom-page-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "loom-page-in": "loom-page-in 0.18s ease forwards",
      },
    },
  },
  plugins: [],
};
export default config;

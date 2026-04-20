"use client";

import { useTranslations } from "next-intl";
import { useLocaleControl } from "@/contexts/intl-provider";

export function LanguageToggle() {
  const { locale, toggleLocale } = useLocaleControl();
  const t = useTranslations("language");

  const isAm = locale === "am";
  const label = isAm ? `🇪🇹 ${t("amharic")}` : `🇬🇧 ${t("english")}`;

  return (
    <button
      type="button"
      onClick={toggleLocale}
      title={t("ariaToggle")}
      aria-label={t("ariaToggle")}
      className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-md border border-loom-border bg-loom-surface px-2.5 py-1.5 text-[12.5px] font-semibold text-loom-text-700 shadow-loom-xs transition-colors hover:border-loom-border-2 hover:bg-loom-hover sm:px-3"
    >
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{isAm ? "🇪🇹" : "🇬🇧"}</span>
    </button>
  );
}

"use client";

import { NextIntlClientProvider } from "next-intl";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import en from "@/messages/en/common.json";
import am from "@/messages/am/common.json";
import { LOCALE_STORAGE_KEY } from "@/lib/locale-init-script";

export type AppLocale = "en" | "am";

function readStoredLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(LOCALE_STORAGE_KEY) === "am" ? "am" : "en";
}

type LocaleControl = {
  locale: AppLocale;
  setLocale: (l: AppLocale) => void;
  toggleLocale: () => void;
};

const LocaleControlContext = createContext<LocaleControl | null>(null);

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>("en");
  const messages = locale === "am" ? am : en;

  useLayoutEffect(() => {
    const next = readStoredLocale();
    setLocaleState(next);
    document.documentElement.lang = next === "am" ? "am" : "en";
    document.documentElement.classList.toggle("locale-am-root", next === "am");
    document.body.classList.toggle("locale-am", next === "am");
  }, []);

  const setLocale = useCallback((l: AppLocale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, l);
    setLocaleState(l);
    document.documentElement.lang = l === "am" ? "am" : "en";
    document.documentElement.classList.toggle("locale-am-root", l === "am");
    document.body.classList.toggle("locale-am", l === "am");
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "am" : "en");
  }, [locale, setLocale]);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale }),
    [locale, setLocale, toggleLocale],
  );

  return (
    <LocaleControlContext.Provider value={value}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone="Africa/Addis_Ababa"
      >
        {children}
      </NextIntlClientProvider>
    </LocaleControlContext.Provider>
  );
}

export function useLocaleControl(): LocaleControl {
  const ctx = useContext(LocaleControlContext);
  if (!ctx) {
    throw new Error("useLocaleControl must be used within IntlProvider");
  }
  return ctx;
}

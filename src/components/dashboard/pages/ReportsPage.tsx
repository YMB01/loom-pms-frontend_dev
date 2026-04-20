"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { downloadReportPdf } from "@/lib/download-report-pdf";
import {
  fetchPropertyOptions,
  propertyOptionsQueryKey,
} from "@/lib/queries/property-options";
import type { Property } from "@/types/resources";

type ReportId = "occupancy" | "revenue" | "overdue" | "maintenance" | "leases" | "sms";

function monthInputDefault(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function ReportsPage() {
  const t = useTranslations("reports");
  const tc = useTranslations("common");
  const [loadingId, setLoadingId] = useState<ReportId | null>(null);
  const [month, setMonth] = useState(monthInputDefault);
  const [propertyId, setPropertyId] = useState("");

  const propsQ = useQuery({
    queryKey: propertyOptionsQueryKey,
    queryFn: fetchPropertyOptions,
    staleTime: 60_000,
  });

  const properties = propsQ.data ?? [];

  const [revMonth, setRevMonth] = useState(String(new Date().getMonth() + 1));
  const [revYear, setRevYear] = useState(String(new Date().getFullYear()));
  const [smsMonth, setSmsMonth] = useState(String(new Date().getMonth() + 1));
  const [smsYear, setSmsYear] = useState(String(new Date().getFullYear()));

  const cards: {
    id: ReportId;
    title: string;
    desc: string;
    filename: string;
    buildParams: () => Record<string, string | number | undefined>;
    path: string;
  }[] = useMemo(
    () => [
      {
        id: "occupancy",
        title: t("cardOccupancy"),
        desc: t("descOccupancy"),
        filename: "occupancy.pdf",
        path: "/reports/occupancy",
        buildParams: () => ({
          month,
          property_id: propertyId ? Number(propertyId) : undefined,
        }),
      },
      {
        id: "revenue",
        title: t("cardRevenue"),
        desc: t("descRevenue"),
        filename: "revenue.pdf",
        path: "/reports/revenue",
        buildParams: () => ({
          month: Number(revMonth),
          year: Number(revYear),
        }),
      },
      {
        id: "overdue",
        title: t("cardOverdue"),
        desc: t("descOverdue"),
        filename: "overdue.pdf",
        path: "/reports/overdue",
        buildParams: () => ({}),
      },
      {
        id: "maintenance",
        title: t("cardMaintenance"),
        desc: t("descMaintenance"),
        filename: "maintenance.pdf",
        path: "/reports/maintenance",
        buildParams: () => ({
          property_id: propertyId ? Number(propertyId) : undefined,
        }),
      },
      {
        id: "leases",
        title: t("cardLeases"),
        desc: t("descLeases"),
        filename: "leases.pdf",
        path: "/reports/leases",
        buildParams: () => ({}),
      },
      {
        id: "sms",
        title: t("cardSms"),
        desc: t("descSms"),
        filename: "sms.pdf",
        path: "/reports/sms",
        buildParams: () => ({
          month: Number(smsMonth),
          year: Number(smsYear),
        }),
      },
    ],
    [t, month, propertyId, revMonth, revYear, smsMonth, smsYear],
  );

  async function generate(card: (typeof cards)[0]) {
    setLoadingId(card.id);
    try {
      await downloadReportPdf(card.path, card.buildParams(), card.filename);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="animate-loom-page-in mx-auto max-w-5xl">
      <h1 className="text-xl font-bold text-loom-text-900 dark:text-loom-text-50">{t("title")}</h1>
      <p className="mt-1 text-sm text-loom-text-500">{t("subtitle")}</p>

      <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-loom-border bg-loom-surface p-4 dark:border-loom-border">
        <div className="min-w-[200px] flex-1">
          <label className="text-[12px] font-medium text-loom-text-500">{t("filterMonth")}</label>
          <input
            type="month"
            className="mt-1 w-full rounded-lg border border-loom-border px-2 py-1.5 text-sm"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="text-[12px] font-medium text-loom-text-500">{t("filterProperty")}</label>
          <select
            className="mt-1 w-full rounded-lg border border-loom-border px-2 py-1.5 text-sm"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
          >
            <option value="">{tc("allProperties")}</option>
            {properties.map((p: Property) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <div>
            <label className="text-[12px] font-medium text-loom-text-500">{t("revenueMonth")}</label>
            <select
              className="mt-1 block rounded-lg border border-loom-border px-2 py-1.5 text-sm"
              value={revMonth}
              onChange={(e) => setRevMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[12px] font-medium text-loom-text-500">{t("revenueYear")}</label>
            <input
              type="number"
              className="mt-1 w-24 rounded-lg border border-loom-border px-2 py-1.5 text-sm"
              value={revYear}
              onChange={(e) => setRevYear(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div>
            <label className="text-[12px] font-medium text-loom-text-500">{t("smsMonth")}</label>
            <select
              className="mt-1 block rounded-lg border border-loom-border px-2 py-1.5 text-sm"
              value={smsMonth}
              onChange={(e) => setSmsMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[12px] font-medium text-loom-text-500">{t("smsYear")}</label>
            <input
              type="number"
              className="mt-1 w-24 rounded-lg border border-loom-border px-2 py-1.5 text-sm"
              value={smsYear}
              onChange={(e) => setSmsYear(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.id}
            className="flex flex-col rounded-2xl border border-loom-border bg-loom-surface p-4 shadow-loom-sm dark:border-loom-border"
          >
            <h2 className="text-[15px] font-bold text-loom-text-900 dark:text-loom-text-50">{c.title}</h2>
            <p className="mt-1 flex-1 text-[12px] text-loom-text-500">{c.desc}</p>
            <button
              type="button"
              disabled={loadingId !== null}
              onClick={() => void generate(c)}
              className="mt-4 rounded-lg bg-[var(--brand-primary,#2563eb)] px-3 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
            >
              {loadingId === c.id ? tc("loading") : t("generatePdf")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

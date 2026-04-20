"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { portalApi } from "@/lib/portal-api";
import type { ApiEnvelope } from "@/types/api";

type Me = {
  tenant: { name: string; company?: { currency?: string } };
  balance_due: number;
  lease: { end_date?: string; rent_amount: number } | null;
};

export default function PortalHomePage() {
  const t = useTranslations("portal");
  const q = useQuery({
    queryKey: ["portal", "me"],
    queryFn: async () => {
      const { data } = await portalApi.get<ApiEnvelope<Me>>("/portal/me");
      if (!data.success || !data.data) throw new Error(data.message || "fail");
      return data.data;
    },
  });

  if (q.isLoading) {
    return <p className="p-6 text-center text-slate-500">{t("loading")}</p>;
  }
  if (q.isError || !q.data) {
    return <p className="p-6 text-center text-red-600">{t("loadError")}</p>;
  }

  const cur = q.data.tenant.company?.currency ?? "ETB";
  return (
    <div className="p-4">
      <div className="rounded-2xl bg-[var(--brand-primary,#2563eb)] p-5 text-white shadow-lg">
        <p className="text-sm opacity-90">{t("hello")}</p>
        <p className="text-xl font-bold">{q.data.tenant.name}</p>
        <p className="mt-4 text-3xl font-bold tabular-nums">
          {cur} {q.data.balance_due.toLocaleString()}
        </p>
        <p className="text-sm opacity-90">{t("balanceDue")}</p>
        {q.data.lease?.end_date ? (
          <p className="mt-3 text-sm">
            {t("nextDue")}: {q.data.lease.end_date}
          </p>
        ) : null}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="/portal/pay"
          className="rounded-xl border border-slate-200 bg-white py-4 text-center text-sm font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {t("quickPay")}
        </Link>
        <Link
          href="/portal/maintenance"
          className="rounded-xl border border-slate-200 bg-white py-4 text-center text-sm font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {t("maintenance")}
        </Link>
      </div>
    </div>
  );
}

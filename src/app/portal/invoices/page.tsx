"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { portalApi } from "@/lib/portal-api";
import type { ApiEnvelope } from "@/types/api";

export default function PortalInvoicesPage() {
  const t = useTranslations("portal");
  const q = useQuery({
    queryKey: ["portal", "invoices"],
    queryFn: async () => {
      const { data } = await portalApi.get<ApiEnvelope<{ invoices: { id: number; amount: number; due_date: string; status: string }[] }>>(
        "/portal/invoices",
      );
      if (!data.success || !data.data) throw new Error("fail");
      return data.data.invoices;
    },
  });

  if (q.isLoading) return <p className="p-4 text-center">{t("loading")}</p>;

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-slate-900 dark:text-white">{t("invoicesTitle")}</h1>
      <ul className="mt-4 space-y-2">
        {(q.data ?? []).map((i) => (
          <li
            key={i.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="font-mono text-sm">#{i.id}</span>
            <span className="text-sm">{i.due_date}</span>
            <span className="font-semibold">{i.amount}</span>
            <span className="text-xs uppercase text-slate-500">{i.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { portalApi } from "@/lib/portal-api";
import type { ApiEnvelope } from "@/types/api";

export default function PortalHistoryPage() {
  const t = useTranslations("portal");
  const q = useQuery({
    queryKey: ["portal", "payments"],
    queryFn: async () => {
      const { data } = await portalApi.get<
        ApiEnvelope<{ payments: { id: number; amount: number; method: string; reference: string; created_at: string }[] }>
      >("/portal/payments");
      if (!data.success || !data.data) throw new Error("fail");
      return data.data.payments;
    },
  });

  if (q.isLoading) return <p className="p-4">{t("loading")}</p>;

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold dark:text-white">{t("historyTitle")}</h1>
      <ul className="mt-4 space-y-2">
        {(q.data ?? []).map((p) => (
          <li
            key={p.id}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="font-semibold">
              {p.amount} — {p.method}
            </span>
            <span className="text-xs text-slate-500">{p.created_at}</span>
            <span className="font-mono text-xs">{p.reference}</span>
            <button
              type="button"
              className="mt-2 text-left text-xs text-[var(--brand-primary,#2563eb)] underline"
              onClick={() => {
                const w = window.open("", "_blank");
                if (w) {
                  w.document.write(
                    `<pre>Receipt #${p.id}\n${p.reference}\n${p.amount}\n${p.method}</pre>`,
                  );
                  w.print();
                }
              }}
            >
              {t("printReceipt")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { portalApi } from "@/lib/portal-api";
import type { ApiEnvelope } from "@/types/api";

const METHODS = ["telebirr", "cbe_birr", "cash", "card"] as const;

export default function PortalPayPage() {
  const t = useTranslations("portal");
  const qc = useQueryClient();
  const [invoiceId, setInvoiceId] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<(typeof METHODS)[number]>("telebirr");

  const invQ = useQuery({
    queryKey: ["portal", "invoices"],
    queryFn: async () => {
      const { data } = await portalApi.get<ApiEnvelope<{ invoices: { id: number; amount: number; status: string }[] }>>(
        "/portal/invoices",
      );
      if (!data.success || !data.data) throw new Error("fail");
      return data.data.invoices.filter((i) => i.status !== "paid");
    },
  });

  const payM = useMutation({
    mutationFn: async () => {
      const { data } = await portalApi.post<ApiEnvelope<unknown>>("/portal/payments", {
        invoice_id: Number(invoiceId),
        amount: Number(amount),
        method,
      });
      if (!data.success) throw new Error(data.message || "fail");
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["portal"] });
      setAmount("");
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold dark:text-white">{t("payTitle")}</h1>
      <label className="mt-4 block text-sm font-medium">{t("selectInvoice")}</label>
      <select
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        value={invoiceId === "" ? "" : String(invoiceId)}
        onChange={(e) => setInvoiceId(e.target.value ? Number(e.target.value) : "")}
      >
        <option value="">{t("choose")}</option>
        {(invQ.data ?? []).map((i) => (
          <option key={i.id} value={i.id}>
            #{i.id} — {i.amount}
          </option>
        ))}
      </select>
      <label className="mt-4 block text-sm font-medium">{t("amount")}</label>
      <input
        type="number"
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <label className="mt-4 block text-sm font-medium">{t("method")}</label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {METHODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMethod(m)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
              method === m
                ? "border-[var(--brand-primary,#2563eb)] bg-blue-50 text-[var(--brand-primary,#2563eb)]"
                : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            {t(`method_${m}`)}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={payM.isPending || !invoiceId || !amount}
        onClick={() => payM.mutate()}
        className="mt-6 w-full rounded-xl bg-[var(--brand-primary,#2563eb)] py-3 font-semibold text-white"
      >
        {t("submitPayment")}
      </button>
    </div>
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { portalApi } from "@/lib/portal-api";
import type { ApiEnvelope } from "@/types/api";

export default function PortalLeasePage() {
  const t = useTranslations("portal");
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");

  const q = useQuery({
    queryKey: ["portal", "lease"],
    queryFn: async () => {
      const { data } = await portalApi.get<
        ApiEnvelope<{ lease: Record<string, unknown> }>
      >("/portal/lease");
      if (!data.success || !data.data) throw new Error("fail");
      return data.data.lease;
    },
  });

  const renewM = useMutation({
    mutationFn: async () => {
      const { data } = await portalApi.post<ApiEnvelope<unknown>>("/portal/lease/renewal", {
        message: msg || null,
      });
      if (!data.success) throw new Error(data.message || "fail");
    },
    onSuccess: () => {
      setMsg("");
      void qc.invalidateQueries({ queryKey: ["portal", "lease"] });
      alert(t("renewalSent"));
    },
  });

  if (q.isLoading) return <p className="p-4">{t("loading")}</p>;
  if (q.isError) return <p className="p-4 text-red-600">{t("loadError")}</p>;

  const lease = q.data as Record<string, unknown>;
  const docUrl = lease.lease_document_url as string | undefined;

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold dark:text-white">{t("leaseTitle")}</h1>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <pre className="overflow-x-auto whitespace-pre-wrap text-xs">{JSON.stringify(lease, null, 2)}</pre>
      </div>
      {docUrl ? (
        <a
          href={docUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold dark:bg-slate-800"
        >
          {t("downloadPdf")}
        </a>
      ) : null}
      <div className="mt-6 space-y-2">
        <textarea
          className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700"
          placeholder={t("renewalNote")}
          rows={3}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button
          type="button"
          onClick={() => renewM.mutate()}
          disabled={renewM.isPending}
          className="w-full rounded-xl bg-[var(--brand-primary,#2563eb)] py-3 font-semibold text-white"
        >
          {t("requestRenewal")}
        </button>
      </div>
    </div>
  );
}

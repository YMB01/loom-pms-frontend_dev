"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { portalApi } from "@/lib/portal-api";
import type { ApiEnvelope } from "@/types/api";

export default function PortalMaintenancePage() {
  const t = useTranslations("portal");
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const q = useQuery({
    queryKey: ["portal", "maintenance"],
    queryFn: async () => {
      const { data } = await portalApi.get<ApiEnvelope<{ requests: Record<string, unknown>[] }>>(
        "/portal/maintenance",
      );
      if (!data.success || !data.data) throw new Error("fail");
      return data.data.requests;
    },
  });

  const m = useMutation({
    mutationFn: async () => {
      const { data } = await portalApi.post<ApiEnvelope<unknown>>("/portal/maintenance", {
        title,
        description,
        priority: "medium",
      });
      if (!data.success) throw new Error(data.message || "fail");
    },
    onSuccess: () => {
      setTitle("");
      setDescription("");
      void qc.invalidateQueries({ queryKey: ["portal", "maintenance"] });
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold dark:text-white">{t("maintTitle")}</h1>
      <ul className="mt-4 space-y-2">
        {(q.data ?? []).map((r: Record<string, unknown>, i: number) => (
          <li key={i} className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            {String(r.title ?? "")}
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">{t("newRequest")}</h2>
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          placeholder={t("reqTitle")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          placeholder={t("reqDesc")}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="button"
          disabled={m.isPending || title.length < 2}
          onClick={() => m.mutate()}
          className="w-full rounded-xl bg-[var(--brand-primary,#2563eb)] py-2 font-semibold text-white"
        >
          {t("submit")}
        </button>
      </div>
    </div>
  );
}

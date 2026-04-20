"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { superAdminApi } from "@/lib/super-admin-api";
import type { SuperAdminCompaniesApiResponse } from "@/types/super-admin";

const schema = z
  .object({
    title: z.string().min(1, "Title is required").max(255),
    body: z.string().min(1, "Message body is required"),
    type: z.enum(["announcement", "warning", "maintenance", "urgent"]),
    sent_to: z.enum(["all", "specific", "active_only", "trial_only"]),
    company_id: z.string().optional(),
    send_email: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.sent_to === "specific") {
      const id = data.company_id?.trim();
      if (!id || !/^\d+$/.test(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a company",
          path: ["company_id"],
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

export default function SuperAdminMessagesPage() {
  const qc = useQueryClient();

  const { data: companiesData } = useQuery({
    queryKey: ["super-admin", "companies", "options"],
    queryFn: async () => {
      const { data: res } =
        await superAdminApi.get<SuperAdminCompaniesApiResponse>(
          "/super-admin/companies?per_page=100"
        );
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to load companies");
      }
      return res.data.companies;
    },
  });

  const { data: history, isLoading, refetch } = useQuery({
    queryKey: ["super-admin", "messages"],
    queryFn: async () => {
      const { data: res } = await superAdminApi.get<{
        success: boolean;
        data?: {
          messages: Array<{
            id: number;
            title: string;
            body: string;
            type: string;
            sent_to: string;
            send_email: boolean;
            sent_at: string | null;
          }>;
        };
      }>("/super-admin/messages");
      if (!res.success || !res.data) {
        throw new Error("Failed to load messages");
      }
      return res.data.messages;
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      body: "",
      type: "announcement",
      sent_to: "all",
      company_id: "",
      send_email: true,
    },
  });

  const sentTo = watch("sent_to");

  const send = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload: Record<string, unknown> = {
        title: values.title.trim(),
        body: values.body,
        type: values.type,
        sent_to: values.sent_to,
        send_email: values.send_email,
      };
      if (values.sent_to === "specific" && values.company_id) {
        payload.company_id = Number(values.company_id);
      }
      const { data: res } = await superAdminApi.post("/super-admin/messages", payload);
      if (!res.success) {
        throw new Error(res.message || "Send failed");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Message sent");
      reset();
      qc.invalidateQueries({ queryKey: ["super-admin", "messages"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const audienceLabel = useMemo(
    () =>
      ({
        all: "All companies",
        specific: "Specific company",
        active_only: "Active subscriptions only",
        trial_only: "Trial only",
      }) as const,
    []
  );

  const typeLabel = useMemo(
    () =>
      ({
        announcement: "📢 Announcement",
        warning: "⚠️ Warning",
        maintenance: "🔧 Maintenance",
        urgent: "🚨 Urgent",
      }) as const,
    []
  );

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold text-loom-text-900">
          Messages &amp; announcements
        </h1>
        <p className="mt-1 text-sm text-loom-text-500">
          Broadcast to companies as in-app notifications and optional email.
        </p>
      </header>

      <section className="rounded-xl border border-loom-border bg-loom-surface p-6 shadow-loom-sm">
        <h2 className="text-sm font-semibold text-loom-text-900">
          Compose
        </h2>
        <form
          className="mt-4 space-y-4"
          onSubmit={handleSubmit((v) => send.mutate(v))}
        >
          <div>
            <label className="text-xs font-medium text-loom-text-500">
              Title
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
              {...register("title")}
            />
            {errors.title ? (
              <p className="mt-1 text-xs text-loom-red-600">
                {errors.title.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="text-xs font-medium text-loom-text-500">
              Body
            </label>
            <textarea
              rows={5}
              className="mt-1 w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
              {...register("body")}
            />
            {errors.body ? (
              <p className="mt-1 text-xs text-loom-red-600">
                {errors.body.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-loom-text-500">
                Type
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
                {...register("type")}
              >
                {(Object.keys(typeLabel) as Array<keyof typeof typeLabel>).map(
                  (k) => (
                    <option key={k} value={k}>
                      {typeLabel[k]}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-loom-text-500">
                Send to
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
                {...register("sent_to")}
              >
                <option value="all">{audienceLabel.all}</option>
                <option value="specific">{audienceLabel.specific}</option>
                <option value="active_only">{audienceLabel.active_only}</option>
                <option value="trial_only">{audienceLabel.trial_only}</option>
              </select>
            </div>
          </div>
          {sentTo === "specific" ? (
            <div>
              <label className="text-xs font-medium text-loom-text-500">
                Company
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
                {...register("company_id")}
              >
                <option value="">Select…</option>
                {(companiesData ?? []).map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
              {errors.company_id ? (
                <p className="mt-1 text-xs text-loom-red-600">
                  {errors.company_id.message}
                </p>
              ) : null}
            </div>
          ) : null}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-loom-text-700">
            <Controller
              name="send_email"
              control={control}
              render={({ field: { value, onChange } }) => (
                <input
                  type="checkbox"
                  className="rounded border-loom-border"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                />
              )}
            />
            Also send email to recipients
          </label>
          <button
            type="submit"
            disabled={isSubmitting || send.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {send.isPending ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-loom-border bg-loom-surface p-6 shadow-loom-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-loom-text-900">History</h2>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-medium text-loom-blue-600 hover:underline"
          >
            Refresh
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <p className="text-sm text-loom-text-400">Loading…</p>
          ) : !history?.length ? (
            <p className="text-sm text-loom-text-400">No messages sent yet.</p>
          ) : (
            history.map((m) => (
              <div
                key={m.id}
                className="rounded-lg border border-loom-border bg-loom-surface-2/50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-loom-text-500">
                  <span className="font-mono">#{m.id}</span>
                  <span className="rounded bg-loom-surface px-1.5 py-0.5">
                    {typeLabel[m.type as keyof typeof typeLabel] ?? m.type}
                  </span>
                  <span>To: {audienceLabel[m.sent_to as keyof typeof audienceLabel] ?? m.sent_to}</span>
                  {m.send_email ? (
                    <span className="text-loom-green-600">+ email</span>
                  ) : (
                    <span className="text-loom-text-400">in-app only</span>
                  )}
                </div>
                <div className="mt-2 font-semibold text-loom-text-900">
                  {m.title}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-loom-text-700">
                  {m.body}
                </p>
                <p className="mt-2 text-[11px] text-loom-text-400">
                  {m.sent_at
                    ? new Date(m.sent_at).toLocaleString()
                    : "—"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

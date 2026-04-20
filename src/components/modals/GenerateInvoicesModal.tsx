"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { afterInvoiceGenerate } from "@/lib/invalidate-queries";
import { FormGrid2, FormGroup, FormLabel, SelectInput } from "@/components/modals/FormFields";
import { ModalShell } from "@/components/modals/ModalShell";

const schema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

type FormValues = z.infer<typeof schema>;

const MONTHS = [
  { v: 1, label: "January" },
  { v: 2, label: "February" },
  { v: 3, label: "March" },
  { v: 4, label: "April" },
  { v: 5, label: "May" },
  { v: 6, label: "June" },
  { v: 7, label: "July" },
  { v: 8, label: "August" },
  { v: 9, label: "September" },
  { v: 10, label: "October" },
  { v: 11, label: "November" },
  { v: 12, label: "December" },
];

export function GenerateInvoicesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const now = new Date();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data } = await api.post<{
        success: boolean;
        data?: { created_count?: number; year?: number; month?: number; due_date?: string };
        message?: string;
      }>("/invoices/generate-monthly", {
        year: values.year,
        month: values.month,
      });
      if (!data.success) {
        throw new Error(data.message || "Generation failed");
      }
      return data;
    },
    onSuccess: async (res) => {
      const created = res.data?.created_count ?? 0;
      const msg =
        res.message?.trim() ||
        `Generated ${created} invoice(s) for ${res.data?.year ?? ""}-${String(res.data?.month ?? "").padStart(2, "0")}.`;
      toast.success(msg);
      reset();
      onClose();
      await afterInvoiceGenerate(qc);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not generate invoices"));
    },
  });

  const yearOpts = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 3 + i);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Generate Monthly Invoices"
      subtitle="Creates pending rent invoices for all active leases for the selected period (skips duplicates)"
      widthClassName="max-w-[440px]"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-loom-border bg-loom-surface px-4 py-2 text-[13px] font-semibold text-loom-text-700 shadow-loom-xs transition hover:bg-loom-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="form-gen-invoices"
            disabled={isSubmitting || mutation.isPending}
            className="rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting || mutation.isPending ? "Generating…" : "Generate"}
          </button>
        </>
      }
    >
      <form id="form-gen-invoices" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <FormGrid2>
          <FormGroup>
            <FormLabel htmlFor="g-year">Year</FormLabel>
            <SelectInput id="g-year" error={errors.year?.message} {...register("year", { valueAsNumber: true })}>
              {yearOpts.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </SelectInput>
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="g-month">Month</FormLabel>
            <SelectInput id="g-month" error={errors.month?.message} {...register("month", { valueAsNumber: true })}>
              {MONTHS.map((m) => (
                <option key={m.v} value={m.v}>
                  {m.label}
                </option>
              ))}
            </SelectInput>
          </FormGroup>
        </FormGrid2>
        <p className="mt-4 text-[12.5px] leading-relaxed text-loom-text-500">
          Invoices use each lease&apos;s monthly rent and are due at the end of the selected month.
        </p>
      </form>
    </ModalShell>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";
import { fetchPaginated } from "@/lib/fetch-paginated";
import { applyLaravelValidationErrors, getApiErrorMessage } from "@/lib/api-errors";
import { afterPaymentMutation } from "@/lib/invalidate-queries";
import type { Invoice } from "@/types/resources";
import {
  AlertSuccess,
  FormGrid2,
  FormGroup,
  FormLabel,
  SelectInput,
  TextInput,
} from "@/components/modals/FormFields";
import { ModalShell } from "@/components/modals/ModalShell";
import { formatEtb } from "@/components/dashboard/ListPageUi";

const METHODS = ["Cash", "Telebirr", "CBE Birr", "Bank Transfer", "Cheque"] as const;

const schema = z.object({
  invoice_id: z.string().min(1, "Select an invoice"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  method: z.string().min(1, "Select a method"),
  reference: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

async function fetchOpenInvoices(): Promise<Invoice[]> {
  const p = await fetchPaginated<Invoice>("/invoices", { per_page: 100, page: 1 });
  return p.items.filter((i) => ["pending", "partial", "overdue"].includes(i.status));
}

export function RecordPaymentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const invoicesQ = useQuery({
    queryKey: ["invoices", "for-payment-modal"],
    queryFn: fetchOpenInvoices,
    enabled: open,
    staleTime: 30_000,
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      invoice_id: "",
      amount: 0,
      method: "Telebirr",
      reference: "",
    },
  });

  const invoiceId = watch("invoice_id");

  useEffect(() => {
    if (!invoicesQ.data || !invoiceId) return;
    const inv = invoicesQ.data.find((i) => i.id === Number(invoiceId));
    if (inv?.amount != null) {
      const amt = parseFloat(String(inv.amount));
      if (!Number.isNaN(amt)) setValue("amount", amt);
    }
  }, [invoiceId, invoicesQ.data, setValue]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const id = Number(values.invoice_id);
      const inv = invoicesQ.data?.find((i) => i.id === id);
      if (!inv) {
        throw new Error("Invoice not found");
      }
      const payload = {
        invoice_id: id,
        tenant_id: inv.tenant_id,
        amount: values.amount,
        method: values.method,
        reference: values.reference?.trim() || undefined,
      };
      const { data } = await api.post<{
        success: boolean;
        data?: { payment?: unknown; sms_queued?: boolean };
        message?: string;
      }>("/payments", payload);
      if (!data.success) {
        throw new Error(data.message || "Failed to record payment");
      }
      return data.data ?? {};
    },
    onSuccess: async (res) => {
      const sms = res?.sms_queued;
      toast.success(
        sms
          ? "Payment recorded — receipt SMS queued"
          : "Payment recorded (tenant has no phone — SMS skipped)"
      );
      reset({ invoice_id: "", amount: 0, method: "Telebirr", reference: "" });
      onClose();
      await afterPaymentMutation(qc);
    },
    onError: (err) => {
      if (!applyLaravelValidationErrors(err, setError)) {
        toast.error(getApiErrorMessage(err, "Could not record payment"));
      }
    },
  });

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Record Payment"
      subtitle="Confirmation SMS is sent automatically when the tenant has a phone number"
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
            form="form-record-payment"
            disabled={isSubmitting || mutation.isPending || invoicesQ.isLoading}
            className="rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting || mutation.isPending ? "Saving…" : "Record Payment"}
          </button>
        </>
      }
    >
      <form id="form-record-payment" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <FormGroup>
          <FormLabel htmlFor="pay-inv">Tenant / Invoice</FormLabel>
          <SelectInput
            id="pay-inv"
            error={errors.invoice_id?.message}
            {...register("invoice_id")}
          >
            <option value="">Select invoice…</option>
            {invoicesQ.data?.map((inv) => {
              const tenant = inv.tenant?.name ?? "Tenant";
              const label = `${tenant} — #${inv.id} (${formatEtb(inv.amount)} · ${inv.status})`;
              return (
                <option key={inv.id} value={String(inv.id)}>
                  {label}
                </option>
              );
            })}
          </SelectInput>
          {invoicesQ.isError ? (
            <p className="mt-1 text-[12px] text-red-600">Could not load invoices.</p>
          ) : null}
        </FormGroup>
        <FormGrid2>
          <FormGroup>
            <FormLabel htmlFor="pay-amt">Amount (ETB)</FormLabel>
            <TextInput
              id="pay-amt"
              type="number"
              step="0.01"
              min={0}
              error={errors.amount?.message}
              {...register("amount", { valueAsNumber: true })}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="pay-method">Payment method</FormLabel>
            <SelectInput id="pay-method" error={errors.method?.message} {...register("method")}>
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </SelectInput>
          </FormGroup>
        </FormGrid2>
        <FormGroup>
          <FormLabel htmlFor="pay-ref">Reference / TX ID</FormLabel>
          <TextInput
            id="pay-ref"
            placeholder="Telebirr TX, bank ref…"
            error={errors.reference?.message}
            {...register("reference")}
          />
        </FormGroup>
        <AlertSuccess>Tenant receives an SMS receipt confirmation when a phone number is on file.</AlertSuccess>
      </form>
    </ModalShell>
  );
}

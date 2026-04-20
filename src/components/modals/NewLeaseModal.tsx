"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";
import { fetchPaginated } from "@/lib/fetch-paginated";
import { applyLaravelValidationErrors, getApiErrorMessage } from "@/lib/api-errors";
import { afterLeaseMutation } from "@/lib/invalidate-queries";
import type { Tenant, Unit } from "@/types/resources";
import {
  FormGrid2,
  FormGroup,
  FormLabel,
  SelectInput,
  TextInput,
} from "@/components/modals/FormFields";
import { ModalShell } from "@/components/modals/ModalShell";

const schema = z
  .object({
    tenant_id: z.string().min(1, "Select a tenant"),
    unit_id: z.string().min(1, "Select a unit"),
    start_date: z.string().min(1, "Start date required"),
    end_date: z.string().min(1, "End date required"),
    rent_amount: z.coerce.number().min(0, "Rent must be 0 or more"),
    deposit_amount: z.coerce.number().min(0).optional(),
    status: z.enum(["active", "expiring", "terminated"]),
  })
  .refine(
    (d) => {
      const a = new Date(d.start_date);
      const b = new Date(d.end_date);
      return b >= a;
    },
    { message: "End date must be on or after start date", path: ["end_date"] }
  );

type FormValues = z.infer<typeof schema>;

async function fetchTenants(): Promise<Tenant[]> {
  const p = await fetchPaginated<Tenant>("/tenants", { per_page: 100, page: 1 });
  return p.items;
}

async function fetchUnits(): Promise<Unit[]> {
  const p = await fetchPaginated<Unit>("/units", { per_page: 200, page: 1 });
  return p.items;
}

export function NewLeaseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const tenantsQ = useQuery({
    queryKey: ["tenants", "for-lease-modal"],
    queryFn: fetchTenants,
    enabled: open,
  });
  const unitsQ = useQuery({
    queryKey: ["units", "for-lease-modal"],
    queryFn: fetchUnits,
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenant_id: "",
      unit_id: "",
      start_date: "",
      end_date: "",
      rent_amount: 0,
      deposit_amount: 0,
      status: "active",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        tenant_id: Number(values.tenant_id),
        unit_id: Number(values.unit_id),
        start_date: values.start_date,
        end_date: values.end_date,
        rent_amount: values.rent_amount,
        deposit_amount: values.deposit_amount ?? 0,
        status: values.status,
      };
      const { data } = await api.post<{ success: boolean; message?: string }>("/leases", payload);
      if (!data.success) {
        throw new Error(data.message || "Failed to create lease");
      }
    },
    onSuccess: async () => {
      toast.success("Lease created successfully");
      reset();
      onClose();
      await afterLeaseMutation(qc);
    },
    onError: (err) => {
      if (!applyLaravelValidationErrors(err, setError)) {
        toast.error(getApiErrorMessage(err, "Could not create lease"));
      }
    },
  });

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="New Lease"
      subtitle="Link a tenant to a unit with rent and term dates"
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
            form="form-new-lease"
            disabled={isSubmitting || mutation.isPending || tenantsQ.isLoading || unitsQ.isLoading}
            className="rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting || mutation.isPending ? "Saving…" : "Create Lease"}
          </button>
        </>
      }
    >
      <form id="form-new-lease" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <FormGrid2>
          <FormGroup>
            <FormLabel htmlFor="l-tenant">Tenant</FormLabel>
            <SelectInput
              id="l-tenant"
              error={errors.tenant_id?.message}
              {...register("tenant_id")}
            >
              <option value="">Select tenant…</option>
              {tenantsQ.data?.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </SelectInput>
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="l-unit">Unit</FormLabel>
            <SelectInput id="l-unit" error={errors.unit_id?.message} {...register("unit_id")}>
              <option value="">Select unit…</option>
              {unitsQ.data?.map((u) => {
                const pname = u.property?.name ?? `Property #${u.property_id}`;
                return (
                  <option key={u.id} value={String(u.id)}>
                    {u.unit_number} — {pname} ({u.status})
                  </option>
                );
              })}
            </SelectInput>
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="l-start">Lease start</FormLabel>
            <TextInput id="l-start" type="date" error={errors.start_date?.message} {...register("start_date")} />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="l-end">Lease end</FormLabel>
            <TextInput id="l-end" type="date" error={errors.end_date?.message} {...register("end_date")} />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="l-rent">Monthly rent (ETB)</FormLabel>
            <TextInput
              id="l-rent"
              type="number"
              step="0.01"
              min={0}
              error={errors.rent_amount?.message}
              {...register("rent_amount", { valueAsNumber: true })}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="l-dep">Deposit (ETB)</FormLabel>
            <TextInput
              id="l-dep"
              type="number"
              step="0.01"
              min={0}
              error={errors.deposit_amount?.message}
              {...register("deposit_amount", { valueAsNumber: true })}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="l-st">Status</FormLabel>
            <SelectInput id="l-st" error={errors.status?.message} {...register("status")}>
              <option value="active">Active</option>
              <option value="expiring">Expiring</option>
              <option value="terminated">Terminated</option>
            </SelectInput>
          </FormGroup>
        </FormGrid2>
      </form>
    </ModalShell>
  );
}

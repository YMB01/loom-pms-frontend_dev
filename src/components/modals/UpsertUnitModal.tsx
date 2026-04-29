"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";
import { applyLaravelValidationErrors, getApiErrorMessage } from "@/lib/api-errors";
import { afterUnitMutation } from "@/lib/invalidate-queries";
import { fetchPropertyOptions, propertyOptionsQueryKey } from "@/lib/queries/property-options";
import type { Unit } from "@/types/resources";
import {
  FormGrid2,
  FormGroup,
  FormLabel,
  SelectInput,
  TextInput,
} from "@/components/modals/FormFields";
import { ModalShell } from "@/components/modals/ModalShell";

const schema = z.object({
  property_id: z.string().min(1, "Select a property"),
  unit_number: z.string().trim().min(1, "Unit number is required").max(255),
  type: z.string().max(255).optional(),
  floor: z.string().max(255).optional(),
  size_sqm: z.string().optional(),
  rent_amount: z.coerce.number().min(0, "Rent must be 0 or more"),
  status: z.enum(["available", "occupied", "maintenance"]),
});

type FormValues = z.infer<typeof schema>;

function defaults(unit?: Unit | null): FormValues {
  return {
    property_id: unit ? String(unit.property_id) : "",
    unit_number: unit?.unit_number ?? "",
    type: unit?.type ?? "",
    floor: unit?.floor != null ? String(unit.floor) : "",
    size_sqm: unit?.size_sqm != null ? String(unit.size_sqm) : "",
    rent_amount: unit?.rent_amount != null ? Number(unit.rent_amount) : 0,
    status:
      unit?.status === "available" || unit?.status === "occupied" || unit?.status === "maintenance"
        ? unit.status
        : "available",
  };
}

export function UpsertUnitModal({
  open,
  onClose,
  unit,
}: {
  open: boolean;
  onClose: () => void;
  unit?: Unit | null;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(unit?.id);
  const propertiesQ = useQuery({
    queryKey: propertyOptionsQueryKey,
    queryFn: fetchPropertyOptions,
    enabled: open,
    staleTime: 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults(unit),
  });

  useEffect(() => {
    if (open) {
      reset(defaults(unit));
    }
  }, [open, reset, unit]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        property_id: Number(values.property_id),
        unit_number: values.unit_number.trim(),
        type: values.type?.trim() || undefined,
        floor: values.floor?.trim() || undefined,
        size_sqm: values.size_sqm?.trim() ? Number(values.size_sqm) : undefined,
        rent_amount: values.rent_amount,
        status: values.status,
      };

      if (isEdit && unit) {
        const { data } = await api.put<{ success: boolean; message?: string }>(
          `/units/${unit.id}`,
          payload,
        );
        if (!data.success) throw new Error(data.message || "Failed to update unit");
        return;
      }

      const { data } = await api.post<{ success: boolean; message?: string }>("/units", payload);
      if (!data.success) throw new Error(data.message || "Failed to create unit");
    },
    onSuccess: async () => {
      toast.success(isEdit ? "Unit updated successfully" : "Unit added successfully");
      onClose();
      await afterUnitMutation(qc);
    },
    onError: (err) => {
      if (!applyLaravelValidationErrors(err, setError)) {
        toast.error(getApiErrorMessage(err, isEdit ? "Could not update unit" : "Could not create unit"));
      }
    },
  });

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={isEdit ? "Manage Unit" : "Add Unit"}
      subtitle="Set property, rent, and occupancy status"
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
            form="form-upsert-unit"
            disabled={isSubmitting || mutation.isPending || propertiesQ.isLoading}
            className="rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting || mutation.isPending ? "Saving…" : isEdit ? "Save Changes" : "Add Unit"}
          </button>
        </>
      }
    >
      <form id="form-upsert-unit" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <FormGrid2>
          <FormGroup>
            <FormLabel htmlFor="unit-property">Property</FormLabel>
            <SelectInput id="unit-property" error={errors.property_id?.message} {...register("property_id")}>
              <option value="">Select property…</option>
              {propertiesQ.data?.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </SelectInput>
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="unit-number">Unit number</FormLabel>
            <TextInput id="unit-number" error={errors.unit_number?.message} {...register("unit_number")} />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="unit-type">Type</FormLabel>
            <TextInput id="unit-type" error={errors.type?.message} {...register("type")} />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="unit-floor">Floor</FormLabel>
            <TextInput id="unit-floor" error={errors.floor?.message} {...register("floor")} />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="unit-size">Size (m²)</FormLabel>
            <TextInput id="unit-size" type="number" min={0} step="0.01" error={errors.size_sqm?.message} {...register("size_sqm")} />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="unit-rent">Rent amount</FormLabel>
            <TextInput
              id="unit-rent"
              type="number"
              min={0}
              step="0.01"
              error={errors.rent_amount?.message}
              {...register("rent_amount", { valueAsNumber: true })}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="unit-status">Status</FormLabel>
            <SelectInput id="unit-status" error={errors.status?.message} {...register("status")}>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </SelectInput>
          </FormGroup>
        </FormGrid2>
      </form>
    </ModalShell>
  );
}

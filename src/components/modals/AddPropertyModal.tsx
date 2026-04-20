"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";
import { applyLaravelValidationErrors, getApiErrorMessage } from "@/lib/api-errors";
import { afterPropertyMutation } from "@/lib/invalidate-queries";
import {
  FormGrid2,
  FormGroup,
  FormLabel,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/modals/FormFields";
import { ModalShell } from "@/components/modals/ModalShell";

const schema = z.object({
  name: z.string().trim().min(1, "Property name is required").max(255),
  type: z.string().max(255).optional(),
  address: z.string().optional(),
  city: z.string().max(255).optional(),
  country: z.string().max(255).optional(),
  total_units: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const PROPERTY_TYPES = ["Residential", "Commercial", "Mixed", "Industrial"] as const;

export function AddPropertyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "Residential",
      address: "",
      city: "",
      country: "Ethiopia",
      total_units: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let total: number | undefined;
      if (values.total_units?.trim()) {
        const n = parseInt(values.total_units.trim(), 10);
        if (!Number.isFinite(n) || n < 0) {
          throw new Error("Total units must be a non-negative number");
        }
        total = n;
      }
      const payload = {
        name: values.name,
        type: values.type?.trim() || undefined,
        address: values.address?.trim() || undefined,
        city: values.city?.trim() || undefined,
        country: values.country?.trim() || undefined,
        total_units: total,
      };
      const { data } = await api.post<{ success: boolean; message?: string }>(
        "/properties",
        payload
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to create property");
      }
    },
    onSuccess: async () => {
      toast.success("Property added successfully");
      reset();
      onClose();
      await afterPropertyMutation(qc);
    },
    onError: (err) => {
      if (!applyLaravelValidationErrors(err, setError)) {
        toast.error(getApiErrorMessage(err, "Could not create property"));
      }
    },
  });

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Add Property"
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
            form="form-add-property"
            disabled={isSubmitting || mutation.isPending}
            className="rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting || mutation.isPending ? "Saving…" : "Add Property"}
          </button>
        </>
      }
    >
      <form
        id="form-add-property"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        className="space-y-0"
      >
        <FormGroup>
          <FormLabel htmlFor="prop-name">Property name</FormLabel>
          <TextInput
            id="prop-name"
            placeholder="e.g. Bole Heights Residence"
            error={errors.name?.message}
            {...register("name")}
          />
        </FormGroup>
        <FormGrid2>
          <FormGroup>
            <FormLabel htmlFor="prop-type">Type</FormLabel>
            <SelectInput id="prop-type" error={errors.type?.message} {...register("type")}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="prop-units">Total units</FormLabel>
            <TextInput
              id="prop-units"
              type="number"
              min={0}
              placeholder="e.g. 12"
              error={errors.total_units?.message}
              {...register("total_units")}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="prop-city">City / Sub-city</FormLabel>
            <TextInput
              id="prop-city"
              placeholder="e.g. Bole"
              error={errors.city?.message}
              {...register("city")}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="prop-country">Country</FormLabel>
            <TextInput
              id="prop-country"
              placeholder="Ethiopia"
              error={errors.country?.message}
              {...register("country")}
            />
          </FormGroup>
        </FormGrid2>
        <FormGroup>
          <FormLabel htmlFor="prop-address">Full address</FormLabel>
          <TextArea
            id="prop-address"
            rows={2}
            placeholder="Street, area description"
            error={errors.address?.message}
            {...register("address")}
          />
        </FormGroup>
      </form>
    </ModalShell>
  );
}

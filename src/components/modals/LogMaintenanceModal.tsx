"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";
import { applyLaravelValidationErrors, getApiErrorMessage } from "@/lib/api-errors";
import { afterMaintenanceMutation } from "@/lib/invalidate-queries";
import {
  fetchPropertyOptions,
  propertyOptionsQueryKey,
} from "@/lib/queries/property-options";
import {
  FormGroup,
  FormLabel,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/modals/FormFields";
import { ModalShell } from "@/components/modals/ModalShell";

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

const schema = z.object({
  property_id: z.string().min(1, "Select a property"),
  unit: z.string().max(255).optional().or(z.literal("")),
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

type FormValues = z.infer<typeof schema>;

export function LogMaintenanceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const propsQ = useQuery({
    queryKey: propertyOptionsQueryKey,
    queryFn: fetchPropertyOptions,
    enabled: open,
    staleTime: 60_000,
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
      property_id: "",
      unit: "",
      title: "",
      description: "",
      priority: "high",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        property_id: Number(values.property_id),
        unit: values.unit?.trim() || undefined,
        title: values.title,
        description: values.description?.trim() || undefined,
        priority: values.priority,
      };
      const { data } = await api.post<{ success: boolean; message?: string }>(
        "/maintenance",
        payload
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to create request");
      }
    },
    onSuccess: async () => {
      toast.success("Maintenance logged — tenant notified when applicable");
      reset();
      onClose();
      await afterMaintenanceMutation(qc);
    },
    onError: (err) => {
      if (!applyLaravelValidationErrors(err, setError)) {
        toast.error(getApiErrorMessage(err, "Could not log maintenance"));
      }
    },
  });

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Log Maintenance Request"
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
            form="form-log-maintenance"
            disabled={isSubmitting || mutation.isPending}
            className="rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting || mutation.isPending ? "Saving…" : "Create Request"}
          </button>
        </>
      }
    >
      <form id="form-log-maintenance" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <FormGroup>
          <FormLabel htmlFor="m-prop">Property</FormLabel>
          <SelectInput
            id="m-prop"
            error={errors.property_id?.message}
            {...register("property_id")}
          >
            <option value="">Select property…</option>
            {propsQ.data?.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </SelectInput>
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="m-unit">Unit label</FormLabel>
          <TextInput
            id="m-unit"
            placeholder="e.g. A-101"
            error={errors.unit?.message}
            {...register("unit")}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="m-title">Title</FormLabel>
          <TextInput
            id="m-title"
            placeholder="e.g. Leaking pipe in bathroom"
            error={errors.title?.message}
            {...register("title")}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="m-priority">Priority</FormLabel>
          <SelectInput id="m-priority" error={errors.priority?.message} {...register("priority")}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </SelectInput>
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="m-desc">Description</FormLabel>
          <TextArea
            id="m-desc"
            rows={3}
            placeholder="Describe the issue in detail…"
            error={errors.description?.message}
            {...register("description")}
          />
        </FormGroup>
      </form>
    </ModalShell>
  );
}

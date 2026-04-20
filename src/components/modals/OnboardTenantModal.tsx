"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";
import { applyLaravelValidationErrors, getApiErrorMessage } from "@/lib/api-errors";
import { afterTenantMutation } from "@/lib/invalidate-queries";
import {
  AlertInfo,
  FormGrid2,
  FormGroup,
  FormLabel,
  TextInput,
} from "@/components/modals/FormFields";
import { ModalShell } from "@/components/modals/ModalShell";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().max(50).optional().or(z.literal("")),
  id_number: z.string().max(255).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function OnboardTenantModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", id_number: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone?.trim() || undefined,
        id_number: values.id_number?.trim() || undefined,
      };
      const { data } = await api.post<{
        success: boolean;
        data?: { sms_queued?: boolean };
        message?: string;
      }>("/tenants", payload);
      if (!data.success) {
        throw new Error(data.message || "Failed to create tenant");
      }
      return data.data ?? {};
    },
    onSuccess: async (res) => {
      const sms = res?.sms_queued;
      toast.success(
        sms
          ? "Tenant created — welcome SMS queued"
          : "Tenant created (no phone on file — SMS not sent)"
      );
      reset();
      onClose();
      await afterTenantMutation(qc);
    },
    onError: (err) => {
      if (!applyLaravelValidationErrors(err, setError)) {
        toast.error(getApiErrorMessage(err, "Could not create tenant"));
      }
    },
  });

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Onboard New Tenant"
      subtitle="A welcome SMS will be sent automatically when a phone number is provided"
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
            form="form-onboard-tenant"
            disabled={isSubmitting || mutation.isPending}
            className="rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-loom-xs transition hover:border-[#1d4ed8] hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting || mutation.isPending ? "Creating…" : "Create Tenant"}
          </button>
        </>
      }
    >
      <form id="form-onboard-tenant" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <FormGrid2>
          <FormGroup>
            <FormLabel htmlFor="ten-name">Full name</FormLabel>
            <TextInput
              id="ten-name"
              placeholder="Kebede Tadesse"
              error={errors.name?.message}
              {...register("name")}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="ten-email">Email</FormLabel>
            <TextInput
              id="ten-email"
              type="email"
              placeholder="email@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="ten-phone">Phone</FormLabel>
            <TextInput
              id="ten-phone"
              placeholder="09xxxxxxxx"
              error={errors.phone?.message}
              {...register("phone")}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="ten-id">ID number</FormLabel>
            <TextInput
              id="ten-id"
              placeholder="National ID / passport"
              error={errors.id_number?.message}
              {...register("id_number")}
            />
          </FormGroup>
        </FormGrid2>
        <AlertInfo>
          Welcome SMS with onboarding details is sent via your configured provider when the tenant
          has a valid phone number.
        </AlertInfo>
      </form>
    </ModalShell>
  );
}

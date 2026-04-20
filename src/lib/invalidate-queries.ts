import type { QueryClient } from "@tanstack/react-query";

/** Broad invalidation by resource prefix (matches nested query keys). */
export async function invalidateResource(
  qc: QueryClient,
  keys: readonly string[]
): Promise<void> {
  await Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: [k] })));
}

export async function afterPropertyMutation(qc: QueryClient): Promise<void> {
  await invalidateResource(qc, ["properties", "dashboard", "units"]);
}

export async function afterTenantMutation(qc: QueryClient): Promise<void> {
  await invalidateResource(qc, ["tenants", "dashboard", "leases"]);
}

export async function afterPaymentMutation(qc: QueryClient): Promise<void> {
  await invalidateResource(qc, ["payments", "invoices", "dashboard"]);
}

export async function afterMaintenanceMutation(qc: QueryClient): Promise<void> {
  await invalidateResource(qc, ["maintenance", "dashboard"]);
}

export async function afterLeaseMutation(qc: QueryClient): Promise<void> {
  await invalidateResource(qc, ["leases", "units", "invoices", "dashboard"]);
}

export async function afterInvoiceGenerate(qc: QueryClient): Promise<void> {
  await invalidateResource(qc, ["invoices", "dashboard"]);
}

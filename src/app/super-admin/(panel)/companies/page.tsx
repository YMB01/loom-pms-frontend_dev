"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { superAdminApi } from "@/lib/super-admin-api";
import type {
  SuperAdminCompaniesApiResponse,
  SuperAdminCompanyRow,
  SuperAdminPlansApiResponse,
} from "@/types/super-admin";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function planBadge(plan: SuperAdminCompanyRow["plan"]) {
  const styles: Record<typeof plan, string> = {
    free: "bg-slate-100 text-slate-700",
    basic: "bg-blue-100 text-blue-800",
    pro: "bg-violet-100 text-violet-800",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[plan]}`}
    >
      {plan}
    </span>
  );
}

function subscriptionStatusBadge(
  status: SuperAdminCompanyRow["subscription_status"]
) {
  const styles: Record<typeof status, string> = {
    active: "bg-emerald-100 text-emerald-800",
    trial: "bg-amber-100 text-amber-800",
    suspended: "bg-red-100 text-red-800",
    cancelled: "bg-slate-200 text-slate-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function SuperAdminCompaniesPage() {
  const queryClient = useQueryClient();

  const { data: plansData } = useQuery({
    queryKey: ["super-admin", "plans"],
    queryFn: async () => {
      const { data: res } =
        await superAdminApi.get<SuperAdminPlansApiResponse>("/super-admin/plans");
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to load plans");
      }
      return res.data.plans;
    },
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["super-admin", "companies"],
    queryFn: async () => {
      const { data: res } =
        await superAdminApi.get<SuperAdminCompaniesApiResponse>(
          "/super-admin/companies"
        );
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to load companies");
      }
      return res.data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["super-admin"] });
  };

  const changePlan = useMutation({
    mutationFn: async ({
      companyId,
      planId,
    }: {
      companyId: number;
      planId: number;
    }) => {
      const { data: res } = await superAdminApi.patch(
        `/super-admin/companies/${companyId}/subscription`,
        { plan_id: planId }
      );
      if (!res.success) {
        throw new Error(res.message || "Could not update plan");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Plan updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activate = useMutation({
    mutationFn: async (id: number) => {
      const { data: res } = await superAdminApi.patch(
        `/super-admin/companies/${id}/activate`
      );
      if (!res.success) {
        throw new Error(res.message || "Activate failed");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Company activated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const suspend = useMutation({
    mutationFn: async (id: number) => {
      const { data: res } = await superAdminApi.patch(
        `/super-admin/companies/${id}/suspend`
      );
      if (!res.success) {
        throw new Error(res.message || "Suspend failed");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Company suspended");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const { data: res } = await superAdminApi.delete(
        `/super-admin/companies/${id}`
      );
      if (!res.success) {
        throw new Error(res.message || "Delete failed");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Company deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const companies = data?.companies ?? [];
  const plans = plansData ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-loom-text-900">Companies</h1>
          <p className="mt-1 text-sm text-loom-text-500">
            Account-level data only — no tenants or invoices.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg border border-loom-border bg-loom-surface px-3 py-1.5 text-sm font-medium text-loom-text-700 shadow-loom-xs hover:bg-loom-surface-2"
        >
          Refresh
        </button>
      </header>

      <div className="overflow-hidden rounded-xl border border-loom-border bg-loom-surface shadow-loom-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-loom-border bg-loom-surface-2 text-xs uppercase tracking-wide text-loom-text-500">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Subscription</th>
                <th className="px-4 py-3 font-medium">Account</th>
                <th className="px-4 py-3 font-medium">Signed up</th>
                <th className="px-4 py-3 font-medium">Properties</th>
                <th className="px-4 py-3 font-medium">Units</th>
                <th className="px-4 py-3 font-medium">Tenants</th>
                <th className="px-4 py-3 font-medium">Last login</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-loom-text-500">
                    Loading…
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-loom-text-500">
                    No companies yet.
                  </td>
                </tr>
              ) : (
                companies.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-loom-border last:border-0 hover:bg-loom-surface-2/60"
                  >
                    <td className="px-4 py-3 font-medium text-loom-text-900">
                      {row.name}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-loom-text-700">
                      {row.email}
                    </td>
                    <td className="min-w-[200px] px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {planBadge(row.plan)}
                        <select
                          className="mt-1 max-w-[220px] rounded-md border border-loom-border bg-loom-surface px-2 py-1 text-xs text-loom-text-900"
                          value={row.plan_id ?? ""}
                          disabled={
                            changePlan.isPending || plans.length === 0
                          }
                          onChange={(e) => {
                            const planId = Number(e.target.value);
                            if (
                              !Number.isFinite(planId) ||
                              planId === row.plan_id
                            ) {
                              return;
                            }
                            changePlan.mutate({
                              companyId: row.id,
                              planId,
                            });
                          }}
                          aria-label={`Change plan for ${row.name}`}
                        >
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${p.price}/mo)
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {subscriptionStatusBadge(row.subscription_status)}
                        {row.trial_ends_at ? (
                          <span className="text-[11px] text-loom-text-400">
                            Trial ends {formatDate(row.trial_ends_at)}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.account_status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {row.account_status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-loom-text-600">
                      {formatDate(row.signup_at)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-loom-text-700">
                      {row.properties_count}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-loom-text-700">
                      {row.units_count}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-loom-text-700">
                      {row.tenants_count}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-loom-text-600">
                      {formatDate(row.last_login_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          disabled={activate.isPending || suspend.isPending}
                          onClick={() => activate.mutate(row.id)}
                          className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Activate
                        </button>
                        <button
                          type="button"
                          disabled={activate.isPending || suspend.isPending}
                          onClick={() => suspend.mutate(row.id)}
                          className="rounded-md bg-amber-600 px-2 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                        >
                          Suspend
                        </button>
                        <button
                          type="button"
                          disabled={remove.isPending}
                          onClick={() => {
                            if (
                              typeof window !== "undefined" &&
                              window.confirm(
                                `Delete “${row.name}” and all related data? This cannot be undone.`
                              )
                            ) {
                              remove.mutate(row.id);
                            }
                          }}
                          className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data?.meta ? (
          <p className="border-t border-loom-border px-4 py-2 text-xs text-loom-text-500">
            Showing {companies.length} of {data.meta.total} companies (page{" "}
            {data.meta.current_page} of {data.meta.last_page})
          </p>
        ) : null}
      </div>
    </div>
  );
}

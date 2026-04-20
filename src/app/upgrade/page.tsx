"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

type BillingOptionsResponse = {
  success: boolean;
  data?: {
    stripe_configured: boolean;
    plans: Array<{
      slug: string;
      name: string;
      price: string;
      max_properties: number | null;
      max_units: number | null;
      max_tenants: number | null;
    }>;
  };
  message: string;
};

function UpgradeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refresh } = useAuth();

  const checkout = searchParams.get("checkout");

  useEffect(() => {
    if (checkout === "success") {
      toast.success("Payment successful. Syncing your account…");
      void refresh().then(() => {
        router.replace("/dashboard");
      });
    } else if (checkout === "cancelled") {
      toast.message("Checkout cancelled.");
      router.replace("/upgrade");
    }
  }, [checkout, refresh, router]);

  const { data: options, isLoading } = useQuery({
    queryKey: ["billing-options"],
    queryFn: async () => {
      const { data: res } = await api.get<BillingOptionsResponse>(
        "/billing/options"
      );
      if (!res.success || !res.data) {
        throw new Error(res.message || "Could not load plans");
      }
      return res.data;
    },
  });

  const startCheckout = useMutation({
    mutationFn: async (planSlug: string) => {
      const { data: res } = await api.post<{
        success: boolean;
        data?: { url: string };
        message: string;
      }>("/billing/checkout", { plan_slug: planSlug });
      if (!res.success || !res.data?.url) {
        throw new Error(res.message || "Checkout unavailable");
      }
      return res.data.url;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openPortal = useMutation({
    mutationFn: async () => {
      const { data: res } = await api.post<{
        success: boolean;
        data?: { url: string };
        message: string;
      }>("/billing/portal");
      if (!res.success || !res.data?.url) {
        throw new Error(res.message || "Billing portal unavailable");
      }
      return res.data.url;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const company = user?.company;
  const sub = company?.subscription;
  const planSlug = sub?.plan?.slug ?? "free";
  const stripeOk = options?.stripe_configured ?? false;
  const portalOk = company?.billing_portal_available ?? false;

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-loom-text-900">
            Choose your Loom PMS plan
          </h1>
          <p className="mt-2 text-sm text-loom-text-500">
            After your trial, subscribe with Stripe to keep full access. Basic is
            $29/mo, Pro is $79/mo (billed automatically each month).
          </p>
          {sub?.trial_ends_at ? (
            <p className="mt-2 text-xs text-loom-text-400">
              Trial ends:{" "}
              {new Date(sub.trial_ends_at).toLocaleString(undefined, {
                dateStyle: "medium",
              })}
            </p>
          ) : null}
        </div>

        {!stripeOk && !isLoading ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Online billing is not configured on this server yet (missing Stripe
            keys). Contact the system administrator.
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {(options?.plans ?? []).map((plan) => (
            <div
              key={plan.slug}
              className="flex flex-col rounded-xl border border-loom-border bg-loom-surface p-6 shadow-loom-sm"
            >
              <h2 className="text-lg font-semibold text-loom-text-900">
                {plan.name}
              </h2>
              <p className="mt-1 text-3xl font-bold text-loom-blue-600">
                ${plan.price}
                <span className="text-sm font-normal text-loom-text-500">
                  /mo
                </span>
              </p>
              <ul className="mt-4 space-y-1 text-sm text-loom-text-600">
                <li>
                  Properties:{" "}
                  {plan.max_properties ?? "Unlimited"}
                </li>
                <li>Units: {plan.max_units ?? "Unlimited"}</li>
                <li>Tenants: {plan.max_tenants ?? "Unlimited"}</li>
              </ul>
              <button
                type="button"
                disabled={
                  !stripeOk ||
                  startCheckout.isPending ||
                  planSlug === plan.slug
                }
                onClick={() => startCheckout.mutate(plan.slug)}
                className="mt-6 rounded-lg bg-loom-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-loom-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {planSlug === plan.slug
                  ? "Current plan"
                  : startCheckout.isPending
                    ? "Redirecting…"
                    : `Subscribe to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {isLoading ? (
          <p className="mt-8 text-center text-sm text-loom-text-500">
            Loading plans…
          </p>
        ) : null}

        {portalOk ? (
          <div className="mt-10 rounded-xl border border-loom-border bg-loom-surface p-4 text-center shadow-loom-sm">
            <p className="text-sm text-loom-text-600">
              Update payment method or cancel in the Stripe customer portal.
            </p>
            <button
              type="button"
              disabled={openPortal.isPending}
              onClick={() => openPortal.mutate()}
              className="mt-3 text-sm font-semibold text-loom-blue-600 hover:underline disabled:opacity-50"
            >
              {openPortal.isPending ? "Opening…" : "Manage billing"}
            </button>
          </div>
        ) : null}

        {!company?.requires_upgrade && company?.status !== "suspended" ? (
          <p className="mt-10 text-center text-sm text-loom-text-500">
            <Link
              href="/dashboard"
              className="text-loom-blue-600 hover:underline"
            >
              Back to dashboard
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#f5f6fa] text-sm text-loom-text-500">
            Loading…
          </div>
        }
      >
        <UpgradeContent />
      </Suspense>
    </ProtectedRoute>
  );
}

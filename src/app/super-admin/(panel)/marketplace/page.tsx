"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { superAdminApi } from "@/lib/super-admin-api";
import type { ApiEnvelope } from "@/types/api";

type Tab = "categories" | "vendors" | "products" | "orders";

export default function SuperAdminMarketplacePage() {
  const t = useTranslations("superAdminPanel");
  const [tab, setTab] = useState<Tab>("vendors");

  const catQ = useQuery({
    queryKey: ["super-admin", "marketplace", "categories"],
    queryFn: async () => {
      const { data } = await superAdminApi.get<
        ApiEnvelope<{ categories: Record<string, unknown>[] }>
      >("/super-admin/marketplace/categories");
      if (!data.success || !data.data) throw new Error(data.message || "Failed");
      return data.data.categories;
    },
  });

  const venQ = useQuery({
    queryKey: ["super-admin", "marketplace", "vendors"],
    queryFn: async () => {
      const { data } = await superAdminApi.get<
        ApiEnvelope<{ vendors: Record<string, unknown>[] }>
      >("/super-admin/marketplace/vendors");
      if (!data.success || !data.data) throw new Error(data.message || "Failed");
      return data.data.vendors;
    },
  });

  const prodQ = useQuery({
    queryKey: ["super-admin", "marketplace", "products"],
    queryFn: async () => {
      const { data } = await superAdminApi.get<
        ApiEnvelope<{ products: Record<string, unknown>[] }>
      >("/super-admin/marketplace/products");
      if (!data.success || !data.data) throw new Error(data.message || "Failed");
      return data.data.products;
    },
  });

  const ordQ = useQuery({
    queryKey: ["super-admin", "marketplace", "orders"],
    queryFn: async () => {
      const { data } = await superAdminApi.get<
        ApiEnvelope<{ orders: Record<string, unknown>[] }>
      >("/super-admin/marketplace/orders");
      if (!data.success || !data.data) throw new Error(data.message || "Failed");
      return data.data.orders;
    },
  });

  const tabs = useMemo(
    () =>
      [
        { id: "categories" as const, label: t("tabCategories") },
        { id: "vendors" as const, label: t("tabVendors") },
        { id: "products" as const, label: t("tabProducts") },
        { id: "orders" as const, label: t("tabOrders") },
      ] as const,
    [t],
  );

  const active = {
    categories: catQ,
    vendors: venQ,
    products: prodQ,
    orders: ordQ,
  }[tab];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold text-loom-text-900">{t("marketplaceTitle")}</h1>
      <p className="mt-1 text-sm text-loom-text-500">{t("marketplaceSubtitle")}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTab(x.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === x.id
                ? "bg-loom-blue-600 text-white"
                : "border border-loom-border bg-loom-surface text-loom-text-600 hover:bg-loom-hover"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-loom-border bg-loom-surface shadow-loom-sm">
        {active.isLoading ? (
          <p className="p-8 text-sm text-loom-text-500">{t("loading")}</p>
        ) : active.isError ? (
          <p className="p-8 text-sm text-red-600">{(active.error as Error)?.message ?? "Error"}</p>
        ) : tab === "categories" ? (
          <CategoriesTable rows={catQ.data ?? []} t={t} />
        ) : tab === "vendors" ? (
          <VendorsTable rows={venQ.data ?? []} t={t} />
        ) : tab === "products" ? (
          <ProductsTable rows={prodQ.data ?? []} t={t} />
        ) : (
          <OrdersTable rows={ordQ.data ?? []} t={t} />
        )}
      </div>
    </div>
  );
}

function CategoriesTable({
  rows,
  t,
}: {
  rows: Record<string, unknown>[];
  t: (key: string) => string;
}) {
  if (rows.length === 0) {
    return <p className="p-8 text-sm text-loom-text-400">{t("empty")}</p>;
  }
  return (
    <table className="w-full min-w-[640px] border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-loom-border bg-loom-bg text-[11px] font-semibold uppercase tracking-wide text-loom-text-400">
          <th className="px-4 py-3">{t("colName")}</th>
          <th className="px-4 py-3">{t("colIcon")}</th>
          <th className="px-4 py-3">{t("colOrder")}</th>
          <th className="px-4 py-3">{t("colActive")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((c) => (
          <tr key={String(c.id)} className="border-b border-loom-border hover:bg-loom-hover">
            <td className="px-4 py-3 font-medium text-loom-text-900">{String(c.name ?? "—")}</td>
            <td className="px-4 py-3 text-loom-text-600">{String(c.icon ?? "—")}</td>
            <td className="px-4 py-3">{String(c.display_order ?? "—")}</td>
            <td className="px-4 py-3">{c.is_active ? t("yes") : t("no")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function VendorsTable({
  rows,
  t,
}: {
  rows: Record<string, unknown>[];
  t: (key: string) => string;
}) {
  if (rows.length === 0) {
    return <p className="p-8 text-sm text-loom-text-400">{t("empty")}</p>;
  }
  return (
    <table className="w-full min-w-[720px] border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-loom-border bg-loom-bg text-[11px] font-semibold uppercase tracking-wide text-loom-text-400">
          <th className="px-4 py-3">{t("colName")}</th>
          <th className="px-4 py-3">{t("colCompany")}</th>
          <th className="px-4 py-3">{t("colCategory")}</th>
          <th className="px-4 py-3">{t("colActive")}</th>
          <th className="px-4 py-3">{t("colApproved")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((v) => (
          <tr key={String(v.id)} className="border-b border-loom-border hover:bg-loom-hover">
            <td className="px-4 py-3 font-medium">{String(v.name ?? "—")}</td>
            <td className="px-4 py-3 font-mono text-xs">{String(v.company_id ?? "—")}</td>
            <td className="px-4 py-3">{String(v.category_id ?? "—")}</td>
            <td className="px-4 py-3">{v.is_active ? t("yes") : t("no")}</td>
            <td className="px-4 py-3">{v.is_approved ? t("yes") : t("no")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProductsTable({
  rows,
  t,
}: {
  rows: Record<string, unknown>[];
  t: (key: string) => string;
}) {
  if (rows.length === 0) {
    return <p className="p-8 text-sm text-loom-text-400">{t("empty")}</p>;
  }
  return (
    <table className="w-full min-w-[800px] border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-loom-border bg-loom-bg text-[11px] font-semibold uppercase tracking-wide text-loom-text-400">
          <th className="px-4 py-3">{t("colName")}</th>
          <th className="px-4 py-3">{t("colVendor")}</th>
          <th className="px-4 py-3">{t("colPrice")}</th>
          <th className="px-4 py-3">{t("colUnit")}</th>
          <th className="px-4 py-3">{t("colActive")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => {
          const vendor = p.vendor as Record<string, unknown> | undefined;
          return (
            <tr key={String(p.id)} className="border-b border-loom-border hover:bg-loom-hover">
              <td className="px-4 py-3 font-medium">{String(p.name ?? "—")}</td>
              <td className="px-4 py-3">{String(vendor?.name ?? p.vendor_id ?? "—")}</td>
              <td className="px-4 py-3">{String(p.price ?? "—")}</td>
              <td className="px-4 py-3">{String(p.unit ?? "—")}</td>
              <td className="px-4 py-3">{p.is_active ? t("yes") : t("no")}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function OrdersTable({
  rows,
  t,
}: {
  rows: Record<string, unknown>[];
  t: (key: string) => string;
}) {
  if (rows.length === 0) {
    return <p className="p-8 text-sm text-loom-text-400">{t("empty")}</p>;
  }
  return (
    <table className="w-full min-w-[880px] border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-loom-border bg-loom-bg text-[11px] font-semibold uppercase tracking-wide text-loom-text-400">
          <th className="px-4 py-3">ID</th>
          <th className="px-4 py-3">{t("colCompany")}</th>
          <th className="px-4 py-3">{t("colProperty")}</th>
          <th className="px-4 py-3">{t("colProduct")}</th>
          <th className="px-4 py-3">{t("colQty")}</th>
          <th className="px-4 py-3">{t("colTotal")}</th>
          <th className="px-4 py-3">{t("colStatus")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((o) => {
          const company = o.company as Record<string, unknown> | undefined;
          const property = o.property as Record<string, unknown> | undefined;
          const product = o.product as Record<string, unknown> | undefined;
          const st = o.status;
          const statusStr =
            st && typeof st === "object" && st !== null && "value" in st
              ? String((st as { value: string }).value)
              : String(st ?? "—");
          return (
            <tr key={String(o.id)} className="border-b border-loom-border hover:bg-loom-hover">
              <td className="px-4 py-3 font-mono text-xs">{String(o.id)}</td>
              <td className="px-4 py-3">{String(company?.name ?? o.company_id ?? "—")}</td>
              <td className="px-4 py-3">{String(property?.name ?? o.property_id ?? "—")}</td>
              <td className="px-4 py-3">{String(product?.name ?? o.product_id ?? "—")}</td>
              <td className="px-4 py-3">{String(o.quantity ?? "—")}</td>
              <td className="px-4 py-3">{String(o.total_price ?? "—")}</td>
              <td className="px-4 py-3 capitalize">{statusStr}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

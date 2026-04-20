"use client";

import { useTranslations } from "next-intl";

const SECTION_NAV_KEY: Record<string, string> = {
  properties: "properties",
  units: "units",
  tenants: "tenants",
  leases: "leases",
  invoices: "invoices",
  payments: "payments",
  maintenance: "maintenance",
  sms: "smsCenter",
  reports: "reports",
  marketplace: "marketplace",
  portal: "tenantPortal",
  settings: "settings",
};

export default function DashboardSectionPage({
  params,
}: {
  params: { section: string };
}) {
  const tNav = useTranslations("nav");
  const tSection = useTranslations("section");
  const navKey = SECTION_NAV_KEY[params.section];
  const title = navKey
    ? tNav(navKey)
    : params.section.charAt(0).toUpperCase() + params.section.slice(1);

  return (
    <div className="rounded-[14px] border border-loom-border bg-loom-surface p-4 shadow-loom-sm sm:p-6">
      <h2 className="text-base font-bold text-loom-text-900 sm:text-sm">{title}</h2>
      <p className="mt-1 text-sm text-loom-text-400 sm:text-xs">
        {tSection("prototype")}
      </p>
    </div>
  );
}

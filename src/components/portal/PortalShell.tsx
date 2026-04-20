"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const NAV = [
  { href: "/portal/home", key: "home" as const },
  { href: "/portal/pay", key: "pay" as const },
  { href: "/portal/invoices", key: "invoices" as const },
  { href: "/portal/maintenance", key: "maintenance" as const },
  { href: "/portal/lease", key: "lease" as const },
  { href: "/portal/history", key: "history" as const },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("portal");
  const hideNav = pathname === "/portal/login";

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#f5f6fa] dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto pb-24">{children}</div>
      <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-[430px] border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] pt-2 dark:border-slate-800 dark:bg-slate-900">
        {NAV.map((n) => {
          const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium ${
                active ? "text-[var(--brand-primary,#2563eb)]" : "text-slate-400"
              }`}
            >
              <span className="text-lg leading-none">●</span>
              {t(`nav.${n.key}`)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

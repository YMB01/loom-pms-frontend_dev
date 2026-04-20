"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function ListPageToolbar({
  children,
  actions,
}: {
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[44px] items-center gap-2 rounded-md border-[1.5px] border-loom-border bg-loom-input px-3 py-1.5 shadow-loom-xs transition focus-within:border-loom-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] sm:min-h-[38px] ${className}`}
    >
      <svg
        className="h-[15px] w-[15px] shrink-0 stroke-loom-text-400"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        className="min-h-[40px] min-w-0 flex-1 border-0 bg-transparent font-sans text-[13px] text-loom-text-900 outline-none placeholder:text-loom-text-400 sm:min-h-0"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function PropertySelect({
  value,
  onChange,
  properties,
  disabled,
}: {
  value: string;
  onChange: (propertyId: string) => void;
  properties: { id: number; name: string }[];
  disabled?: boolean;
}) {
  const t = useTranslations("common");
  return (
    <select
      className="min-h-[44px] w-full min-w-0 cursor-pointer rounded-md border-[1.5px] border-loom-border bg-loom-input px-3 text-[13px] text-loom-text-900 shadow-loom-xs outline-none transition focus:border-loom-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] disabled:opacity-50 md:min-h-[38px] md:w-auto md:min-w-[185px]"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{t("allProperties")}</option>
      {properties.map((p) => (
        <option key={p.id} value={String(p.id)}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

export function StatusTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mb-5 border-b-[1.5px] border-loom-border">
      <div className="-mx-1 flex gap-0 overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`mb-[-1.5px] shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-4 py-2.5 font-sans text-[13.5px] font-medium transition-colors md:py-[9px] ${
                isActive
                  ? "border-loom-blue-600 font-semibold text-loom-blue-600"
                  : "text-loom-text-500 hover:text-loom-text-700"
              } `}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-loom-border bg-loom-surface shadow-loom-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function CardRow({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-loom-border bg-loom-surface p-4 shadow-loom-sm">
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

export function CardField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-loom-text-400">
        {label}
      </span>
      <div className="min-w-0 break-words text-[13px] text-loom-text-800">{children}</div>
    </div>
  );
}

export function ResponsiveTable({
  table,
  cards,
  footer,
  cardsWrapperClassName = "space-y-3 p-3",
  /** When true, omit outer card chrome (use inside an existing panel). */
  embedded = false,
}: {
  table: ReactNode;
  cards: ReactNode;
  footer?: ReactNode;
  cardsWrapperClassName?: string;
  embedded?: boolean;
}) {
  const t = useTranslations("list");
  const mdUp = useMediaQuery("(min-width: 768px)");
  const [view, setView] = useState<"table" | "cards">("table");

  return (
    <div
      className={
        embedded
          ? ""
          : "overflow-hidden rounded-[14px] border border-loom-border bg-loom-surface shadow-loom-sm"
      }
    >
      {!mdUp ? (
        <div className="flex items-center justify-end gap-2 border-b border-loom-border bg-loom-surface-2 px-3 py-2">
          <span className="text-[11px] font-medium text-loom-text-400">{t("view")}</span>
          <div className="inline-flex rounded-lg border border-loom-border bg-loom-surface p-0.5 shadow-loom-xs">
            <button
              type="button"
              onClick={() => setView("table")}
              className={`min-h-9 min-w-[76px] rounded-md px-3 text-[12.5px] font-semibold transition-colors ${
                view === "table"
                  ? "bg-loom-blue-600 text-white"
                  : "text-loom-text-600 hover:bg-loom-hover"
              }`}
            >
              {t("table")}
            </button>
            <button
              type="button"
              onClick={() => setView("cards")}
              className={`min-h-9 min-w-[76px] rounded-md px-3 text-[12.5px] font-semibold transition-colors ${
                view === "cards"
                  ? "bg-loom-blue-600 text-white"
                  : "text-loom-text-600 hover:bg-loom-hover"
              }`}
            >
              {t("cards")}
            </button>
          </div>
        </div>
      ) : null}

      {mdUp ? (
        <>
          <div className="overflow-x-auto">{table}</div>
          {footer}
        </>
      ) : view === "table" ? (
        <>
          <div className="overflow-x-auto">{table}</div>
          {footer}
        </>
      ) : (
        <>
          <div className={cardsWrapperClassName}>{cards}</div>
          {footer}
        </>
      )}
    </div>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th className="border-b border-loom-border bg-loom-surface-2 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.6px] text-loom-text-400 first:rounded-tl-md last:rounded-tr-md">
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`border-b border-loom-border px-4 py-[13px] text-[13px] text-loom-text-500 last:border-b-0 ${className}`}
    >
      {children}
    </td>
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse p-4">
      <div className="mb-3 flex gap-2">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-loom-bg-2" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="mb-2 flex gap-2">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-10 flex-1 rounded bg-loom-bg" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function QueryError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const t = useTranslations("common");
  return (
    <div className="rounded-[14px] border border-red-200 bg-red-50 p-6 shadow-loom-sm">
      <p className="text-sm font-semibold text-red-800">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md border border-loom-border bg-loom-surface px-4 py-2 text-sm font-semibold text-loom-text-700 shadow-loom-xs transition-colors hover:bg-loom-hover"
      >
        {t("retry")}
      </button>
    </div>
  );
}

export function PaginationBar({
  meta,
  onPage,
  disabled,
}: {
  meta: { current_page: number; last_page: number; total: number; per_page: number };
  onPage: (page: number) => void;
  disabled?: boolean;
}) {
  const tp = useTranslations("pagination");
  const tc = useTranslations("common");
  const { current_page: page, last_page, total, per_page } = meta;
  const from = total === 0 ? 0 : (page - 1) * per_page + 1;
  const to = Math.min(page * per_page, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-loom-border bg-loom-surface-2 px-4 py-3 text-[12.5px] text-loom-text-500">
      <span>
        {tp("showing")}{" "}
        <span className="font-mono font-semibold text-loom-text-900">
          {from}–{to}
        </span>{" "}
        {tp("of")}{" "}
        <span className="font-mono font-semibold text-loom-text-900">{total}</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onPage(page - 1)}
          className="min-h-11 rounded-md border border-loom-border bg-loom-surface px-3 py-1.5 text-[13px] font-semibold text-loom-text-700 shadow-loom-xs transition hover:bg-loom-hover disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0"
        >
          {tc("previous")}
        </button>
        <span className="font-mono text-[12px] text-loom-text-400">
          {tp("page")} {page} / {Math.max(1, last_page)}
        </span>
        <button
          type="button"
          disabled={disabled || page >= last_page}
          onClick={() => onPage(page + 1)}
          className="min-h-11 rounded-md border border-loom-border bg-loom-surface px-3 py-1.5 text-[13px] font-semibold text-loom-text-700 shadow-loom-xs transition hover:bg-loom-hover disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0"
        >
          {tc("next")}
        </button>
      </div>
    </div>
  );
}

export function formatEtb(amount: string | number | null | undefined): string {
  const n = typeof amount === "string" ? parseFloat(amount) : Number(amount ?? 0);
  if (Number.isNaN(n)) return "ETB 0";
  return `ETB ${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function typeBadgeClass(type: string | null | undefined): string {
  const t = (type ?? "").toLowerCase();
  if (t.includes("commercial")) return "bg-violet-100 text-violet-600";
  if (t.includes("residential")) return "bg-loom-blue-100 text-loom-blue-600";
  if (t.includes("mixed")) return "bg-cyan-100 text-cyan-600";
  return "bg-loom-bg-2 text-loom-text-500";
}

export function invoiceStatusBadge(status: string): string {
  const s = status.toLowerCase();
  if (s === "paid") return "bg-emerald-100 text-emerald-600";
  if (s === "partial") return "bg-loom-amber-100 text-loom-amber-600";
  if (s === "overdue") return "bg-red-100 text-red-600";
  return "bg-loom-blue-100 text-loom-blue-600";
}

export function leaseStatusBadge(status: string): string {
  const s = status.toLowerCase();
  if (s === "active") return "bg-emerald-100 text-emerald-600";
  if (s === "expiring") return "bg-loom-amber-100 text-loom-amber-600";
  if (s === "terminated") return "bg-red-100 text-red-600";
  return "bg-loom-bg-2 text-loom-text-500";
}

export function unitStatusBadge(status: string): string {
  const s = status.toLowerCase();
  if (s === "occupied") return "bg-emerald-100 text-emerald-600";
  if (s === "available") return "bg-loom-blue-100 text-loom-blue-600";
  return "bg-loom-amber-100 text-loom-amber-600";
}

export function maintStatusBadge(status: string): string {
  const s = status.toLowerCase();
  if (s === "resolved") return "bg-emerald-100 text-emerald-600";
  if (s === "in_progress") return "bg-loom-blue-100 text-loom-blue-600";
  return "bg-loom-amber-100 text-loom-amber-600";
}

export function smsStatusBadge(status: string): string {
  const s = status.toLowerCase();
  if (s === "sent" || s === "delivered") return "bg-emerald-100 text-emerald-600";
  if (s === "failed") return "bg-red-100 text-red-600";
  return "bg-loom-amber-100 text-loom-amber-600";
}

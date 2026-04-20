"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

export function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  widthClassName = "max-w-[600px]",
  paddingBodyClassName = "p-6",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
  paddingBodyClassName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-end justify-center bg-slate-900/45 p-0 backdrop-blur-[3px] sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[100dvh] w-full flex-col overflow-y-auto rounded-none border border-loom-border bg-loom-surface shadow-loom-xl transition-transform duration-200 max-md:min-h-[100dvh] sm:max-h-[90vh] sm:rounded-[18px] ${widthClassName}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-loom-border px-4 pb-4 pt-4 sm:px-6 sm:pb-[18px] sm:pt-[22px]">
          <div className="min-w-0 pr-2">
            <div className="text-base font-bold text-loom-text-900">{title}</div>
            {subtitle ? (
              <div className="mt-0.5 text-xs text-loom-text-400">{subtitle}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-loom-border bg-transparent text-[17px] text-loom-text-400 transition-colors hover:border-loom-red-100 hover:bg-loom-red-100 hover:text-loom-red-600 sm:h-7 sm:min-h-0 sm:w-7 sm:min-w-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className={`flex-1 ${paddingBodyClassName}`}>{children}</div>
        {footer !== undefined ? (
          <div className="flex flex-col-reverse gap-2 rounded-b-[18px] border-t border-loom-border bg-loom-surface-2 px-4 py-4 sm:flex-row sm:justify-end sm:px-6 [&>button]:min-h-11 [&>button]:w-full sm:[&>button]:w-auto">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Map raw API / display strings to translated status labels (next-intl `t` from the matching namespace). */
export function translateInvoiceStatus(raw: string, t: (key: string) => string): string {
  const s = raw.toLowerCase().replace(/\s+/g, "_");
  if (s === "paid" || s === "partial" || s === "overdue" || s === "pending") return t(s);
  return raw;
}

export function translateMaintStatus(raw: string, t: (key: string) => string): string {
  const s = raw.toLowerCase().replace(/\s+/g, "_");
  if (s === "open" || s === "in_progress" || s === "resolved") return t(s);
  return raw.replace(/_/g, " ");
}

export function translateLeaseStatus(raw: string, t: (key: string) => string): string {
  const s = raw.toLowerCase().replace(/\s+/g, "_");
  if (s === "active" || s === "expiring" || s === "terminated") return t(s);
  return raw;
}

export function translateUnitStatus(raw: string, t: (key: string) => string): string {
  const s = raw.toLowerCase().replace(/\s+/g, "_");
  if (s === "occupied" || s === "available" || s === "maintenance") return t(s);
  return raw;
}

export function translateSmsStatus(raw: string, t: (key: string) => string): string {
  const s = raw.toLowerCase().replace(/\s+/g, "_");
  if (s === "sent" || s === "delivered" || s === "failed" || s === "queued" || s === "pending")
    return t(s);
  return raw;
}

export function translatePriority(raw: string, t: (key: string) => string): string {
  const s = raw.toLowerCase().replace(/\s+/g, "_");
  if (s === "low" || s === "medium" || s === "high" || s === "urgent") return t(s);
  return raw;
}

/** Map payment method labels from API to `payments.*` keys. */
export function translatePaymentMethod(raw: string, t: (key: string) => string): string {
  const m = raw.toLowerCase();
  if (m.includes("telebirr")) return t("telebirr");
  if (m.includes("cbe")) return t("cbeBirr");
  if (m === "cash") return t("cash");
  if (m.includes("bank") || m.includes("transfer")) return t("bankTransfer");
  return raw;
}

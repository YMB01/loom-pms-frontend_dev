import { api } from "@/lib/api";
import type { ApiEnvelope, Paginated } from "@/types/api";

/** Build query params: drops empty values and optional `all` status keys. */
export function listParams(
  raw: Record<string, string | number | undefined | null>,
  options?: { statusKey?: string }
): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  const statusKey = options?.statusKey ?? "status";
  for (const [k, v] of Object.entries(raw)) {
    if (v === undefined || v === null || v === "") continue;
    if (k === statusKey && v === "all") continue;
    out[k] = typeof v === "number" ? v : String(v);
  }
  return out;
}

export async function fetchPaginated<T>(
  path: string,
  raw: Record<string, string | number | undefined | null>,
  options?: { statusKey?: string }
): Promise<Paginated<T>> {
  const params = listParams(raw, options);
  const { data } = await api.get<ApiEnvelope<Paginated<T>>>(path, { params });
  if (!data.success || !data.data) {
    throw new Error(data.message || "Request failed");
  }
  return data.data;
}

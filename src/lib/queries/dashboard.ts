import { api } from "@/lib/api";
import type { DashboardApiEnvelope, DashboardData } from "@/types/dashboard";

export const dashboardQueryKey = ["dashboard"] as const;

export async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardApiEnvelope>("/dashboard");
  if (!data.success || !data.data) {
    throw new Error(data.message || "Failed to load dashboard");
  }
  return data.data;
}

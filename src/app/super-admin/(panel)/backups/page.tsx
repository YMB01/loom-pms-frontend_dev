"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { superAdminApi } from "@/lib/super-admin-api";
import type {
  SuperAdminBackupRunApiResponse,
  SuperAdminBackupsApiResponse,
  SuperAdminBackupSettingsApiResponse,
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

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v < 10 && i > 0 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  const styles =
    s === "completed" || s === "success"
      ? "bg-emerald-100 text-emerald-800"
      : s === "failed" || s === "error"
        ? "bg-red-100 text-red-800"
        : "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  );
}

export default function SuperAdminBackupsPage() {
  const queryClient = useQueryClient();

  const { data: settingsData } = useQuery({
    queryKey: ["super-admin", "backups", "settings"],
    queryFn: async () => {
      const { data: res } =
        await superAdminApi.get<SuperAdminBackupSettingsApiResponse>(
          "/super-admin/backups/settings"
        );
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to load backup settings");
      }
      return res.data;
    },
  });

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["super-admin", "backups", "list"],
    queryFn: async () => {
      const { data: res } =
        await superAdminApi.get<SuperAdminBackupsApiResponse>(
          "/super-admin/backups"
        );
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to load backups");
      }
      return res.data;
    },
    refetchInterval: 15_000,
  });

  const runBackup = useMutation({
    mutationFn: async () => {
      const { data: res } =
        await superAdminApi.post<SuperAdminBackupRunApiResponse>(
          "/super-admin/backups/run"
        );
      if (!res.success) {
        throw new Error(res.message || "Could not queue backup");
      }
      return res;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Backup queued");
      queryClient.invalidateQueries({ queryKey: ["super-admin", "backups"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateFrequency = useMutation({
    mutationFn: async (frequency: "daily" | "weekly") => {
      const { data: res } = await superAdminApi.patch(
        "/super-admin/backups/settings",
        { frequency }
      );
      if (!res.success) {
        throw new Error(res.message || "Could not update schedule");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Schedule updated");
      queryClient.invalidateQueries({
        queryKey: ["super-admin", "backups", "settings"],
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const { data: res } = await superAdminApi.delete(
        `/super-admin/backups/${id}`
      );
      if (!res.success) {
        throw new Error(res.message || "Delete failed");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Backup removed");
      queryClient.invalidateQueries({ queryKey: ["super-admin", "backups"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const download = async (id: number, filename: string) => {
    try {
      const res = await superAdminApi.get(`/super-admin/backups/${id}/download`, {
        responseType: "blob",
      });
      const blob = res.data as Blob;
      const ct = res.headers["content-type"] ?? "";
      if (ct.includes("application/json")) {
        const text = await blob.text();
        try {
          const json = JSON.parse(text) as { message?: string };
          throw new Error(json.message || "Download failed");
        } catch (e) {
          if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
            throw e;
          }
          throw new Error("Download failed");
        }
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `backup-${id}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    }
  };

  const backups = data?.backups ?? [];
  const frequency = settingsData?.frequency ?? "daily";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-loom-text-900">Backups</h1>
          <p className="mt-1 text-sm text-loom-text-500">
            Database archives via Spatie Laravel Backup. Automatic runs use the
            server scheduler (2:00 daily or Sunday for weekly); old files are
            pruned after 30 days.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="rounded-lg border border-loom-border bg-loom-surface px-3 py-1.5 text-sm font-medium text-loom-text-700 shadow-loom-xs hover:bg-loom-surface-2 disabled:opacity-60"
          >
            {isRefetching ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={() => runBackup.mutate()}
            disabled={runBackup.isPending}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-loom-xs hover:bg-slate-800 disabled:opacity-60"
          >
            {runBackup.isPending ? "Queueing…" : "Run backup now"}
          </button>
        </div>
      </header>

      <section className="rounded-xl border border-loom-border bg-loom-surface p-4 shadow-loom-sm md:p-5">
        <h2 className="text-sm font-semibold text-loom-text-900">
          Automatic schedule
        </h2>
        <p className="mt-1 text-sm text-loom-text-500">
          Choose how often the server should run{" "}
          <code className="rounded bg-loom-surface-2 px-1 py-0.5 text-xs">
            php artisan backup:run
          </code>{" "}
          (requires cron + queue worker on the API host).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-loom-text-700" htmlFor="backup-frequency">
            Frequency
          </label>
          <select
            id="backup-frequency"
            className="rounded-lg border border-loom-border bg-loom-surface px-3 py-2 text-sm text-loom-text-900"
            value={frequency}
            disabled={updateFrequency.isPending}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "daily" || v === "weekly") {
                updateFrequency.mutate(v);
              }
            }}
          >
            <option value="daily">Daily (2:00)</option>
            <option value="weekly">Weekly (Sundays 2:00)</option>
          </select>
        </div>
      </section>

      <div className="overflow-hidden rounded-xl border border-loom-border bg-loom-surface shadow-loom-sm">
        <div className="border-b border-loom-border px-4 py-3 md:px-5">
          <h2 className="text-sm font-semibold text-loom-text-900">
            Backup history
          </h2>
          <p className="mt-0.5 text-xs text-loom-text-500">
            {dataUpdatedAt
              ? `Last updated ${formatDate(new Date(dataUpdatedAt).toISOString())} · auto-refresh every 15s`
              : "Auto-refresh every 15s while this page is open"}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-loom-border bg-loom-surface-2 text-xs uppercase tracking-wide text-loom-text-500">
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-loom-text-500"
                  >
                    Loading…
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-loom-text-500"
                  >
                    No backups yet. Run one manually or wait for the scheduled
                    job.
                  </td>
                </tr>
              ) : (
                backups.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-loom-border last:border-0 hover:bg-loom-surface-2/60"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-loom-text-600">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="max-w-[280px] truncate px-4 py-3 font-medium text-loom-text-900">
                      {row.filename}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-loom-text-700">
                      {formatBytes(row.size)}
                    </td>
                    <td className="px-4 py-3">{statusBadge(row.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => download(row.id, row.filename)}
                          className="rounded-md border border-loom-border bg-loom-surface px-2 py-1 text-xs font-medium text-loom-text-800 hover:bg-loom-surface-2"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          disabled={remove.isPending}
                          onClick={() => {
                            if (
                              typeof window !== "undefined" &&
                              window.confirm(
                                `Delete backup “${row.filename}”? This cannot be undone.`
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
      </div>
    </div>
  );
}

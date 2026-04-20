"use client";

import { useEffect } from "react";

/**
 * Catches runtime errors in route segments (nested under `layout.tsx`).
 * Required for a stable App Router error UI (avoids “missing required error components”).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-[15px] font-semibold text-loom-text-900 dark:text-loom-text-50">
        Something went wrong
      </p>
      {error.digest ? (
        <p className="font-mono text-[11px] text-loom-text-400">Error ID: {error.digest}</p>
      ) : null}
      <p className="max-w-md text-[13px] text-loom-text-600 dark:text-loom-text-400">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg border border-loom-border bg-loom-surface px-4 py-2 text-[13px] font-semibold text-loom-text-800 shadow-loom-xs transition hover:bg-loom-hover dark:border-loom-border dark:text-loom-text-100"
      >
        Try again
      </button>
    </div>
  );
}

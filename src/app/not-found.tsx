import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-4xl font-bold tabular-nums text-loom-text-400">404</p>
      <p className="text-[15px] font-semibold text-loom-text-900 dark:text-loom-text-50">
        Page not found
      </p>
      <p className="max-w-md text-[13px] text-loom-text-600 dark:text-loom-text-400">
        The page you requested does not exist or was moved.
      </p>
      <Link
        href="/login"
        className="rounded-lg border border-loom-blue-600 bg-loom-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-loom-xs hover:border-[#1d4ed8] hover:bg-[#1d4ed8]"
      >
        Go to login
      </Link>
    </div>
  );
}

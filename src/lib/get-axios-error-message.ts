import axios from "axios";
import type { AxiosError } from "axios";

function extractLaravelMessage(data: unknown): string | undefined {
  if (data == null) {
    return undefined;
  }
  if (typeof data === "string") {
    const t = data.trim();
    if (t.startsWith("{") || t.startsWith("[")) {
      try {
        const parsed = JSON.parse(t) as { message?: unknown };
        if (typeof parsed.message === "string" && parsed.message.trim() !== "") {
          return parsed.message;
        }
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
  if (typeof data === "object" && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string" && m.trim() !== "") {
      return m;
    }
  }
  return undefined;
}

const SEED_HINT =
  " If you never seeded the database, run in loom-pms-api: php artisan migrate:fresh --seed — then use admin@admin.com / admin.";

/**
 * Maps Axios/API failures to a clear message. Laravel JSON errors use `{ success, message, data }`.
 */
export function getAxiosApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Something went wrong. Please try again.";
  }

  const err = error as AxiosError;

  if (
    err.code === "ERR_NETWORK" ||
    err.code === "ECONNABORTED" ||
    !err.response
  ) {
    return "Cannot reach the API. If you use local dev: (1) Start Laravel: cd loom-pms-api && php artisan serve --host=127.0.0.1 --port=8000. (2) Start Next: cd loom-pms-frontend && npm run dev. (3) Leave NEXT_PUBLIC_API_URL unset in .env.local so the browser uses /api-proxy → :8000; restart npm run dev after any .env change. (4) Test: curl http://127.0.0.1:8000/api/health — should return JSON.";
  }

  const status = err.response.status;

  if (status === 502 || status === 503 || status === 504) {
    return "The dev server could not proxy to Laravel on 127.0.0.1:8000. Run: cd loom-pms-api && php artisan serve --host=127.0.0.1 --port=8000 and keep it open, then reload.";
  }
  const data = err.response.data;
  const apiMsg = extractLaravelMessage(data);

  if (apiMsg) {
    if (status === 401 && apiMsg.toLowerCase().includes("invalid")) {
      return `${apiMsg}${SEED_HINT}`;
    }
    return apiMsg;
  }

  if (status === 422 && data && typeof data === "object" && "data" in data) {
    const fields = (data as { data?: Record<string, string[] | string> }).data;
    if (fields && typeof fields === "object") {
      const flat = Object.values(fields).flat() as string[];
      const first = flat.find((s) => typeof s === "string" && s.length > 0);
      if (first) {
        return first;
      }
    }
  }

  if (status === 404) {
    return "API route not found. NEXT_PUBLIC_API_URL must include /api (example: http://127.0.0.1:8000/api).";
  }

  if (status === 401) {
    return `Invalid email or password.${SEED_HINT}`;
  }

  return "Invalid email or password. Please try again.";
}

import { isAxiosError } from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/** Map Laravel 422 `errors` object onto react-hook-form field errors. */
export function applyLaravelValidationErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>
): boolean {
  if (!isAxiosError(err) || err.response?.status !== 422) {
    return false;
  }
  const data = err.response.data as { errors?: Record<string, string[]>; message?: string };
  const errors = data?.errors;
  if (!errors || typeof errors !== "object") {
    return false;
  }
  for (const [key, messages] of Object.entries(errors)) {
    const msg = Array.isArray(messages) ? messages[0] : String(messages);
    if (msg) {
      setError(key as Path<T>, { type: "server", message: msg });
    }
  }
  return true;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message && typeof data.message === "string") {
      return data.message;
    }
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

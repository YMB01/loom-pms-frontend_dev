import { redirect } from "next/navigation";

/**
 * `/` is handled by `src/middleware.ts` (login vs dashboard).
 * This page is a fallback if middleware is skipped.
 */
export default function Home() {
  redirect("/login");
}

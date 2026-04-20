import { redirect } from "next/navigation";

/** Legacy path: tenant portal lives at `/portal`. */
export default function DashboardPortalRedirectPage() {
  redirect("/portal");
}

import { DashboardLayoutClient } from "@/components/DashboardLayoutClient";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </ProtectedRoute>
  );
}

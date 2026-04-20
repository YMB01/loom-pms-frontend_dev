import { PortalShell } from "@/components/portal/PortalShell";
import { PortalAuthProvider } from "@/contexts/portal-auth-context";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalAuthProvider>
      <PortalShell>{children}</PortalShell>
    </PortalAuthProvider>
  );
}

"use client";

import { AddPropertyModal } from "@/components/modals/AddPropertyModal";
import { GenerateInvoicesModal } from "@/components/modals/GenerateInvoicesModal";
import { LogMaintenanceModal } from "@/components/modals/LogMaintenanceModal";
import { NewLeaseModal } from "@/components/modals/NewLeaseModal";
import { OnboardTenantModal } from "@/components/modals/OnboardTenantModal";
import { QuickAddModal } from "@/components/modals/QuickAddModal";
import { RecordPaymentModal } from "@/components/modals/RecordPaymentModal";
import { useDashboardModals } from "@/contexts/dashboard-modals-context";

export function DashboardModalsHost() {
  const { active, closeModal } = useDashboardModals();

  return (
    <>
      <QuickAddModal open={active === "quick-add"} onClose={closeModal} />
      <AddPropertyModal open={active === "add-property"} onClose={closeModal} />
      <OnboardTenantModal open={active === "onboard-tenant"} onClose={closeModal} />
      <RecordPaymentModal open={active === "record-payment"} onClose={closeModal} />
      <LogMaintenanceModal open={active === "log-maintenance"} onClose={closeModal} />
      <NewLeaseModal open={active === "new-lease"} onClose={closeModal} />
      <GenerateInvoicesModal open={active === "generate-invoices"} onClose={closeModal} />
    </>
  );
}

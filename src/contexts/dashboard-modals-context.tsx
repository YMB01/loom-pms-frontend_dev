"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type DashboardModalId =
  | "quick-add"
  | "add-property"
  | "onboard-tenant"
  | "record-payment"
  | "log-maintenance"
  | "new-lease"
  | "generate-invoices"
  | null;

type Ctx = {
  active: DashboardModalId;
  openModal: (id: Exclude<DashboardModalId, null>) => void;
  closeModal: () => void;
};

const DashboardModalsContext = createContext<Ctx | null>(null);

export function DashboardModalsProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<DashboardModalId>(null);

  const openModal = useCallback((id: Exclude<DashboardModalId, null>) => {
    setActive(id);
  }, []);

  const closeModal = useCallback(() => {
    setActive(null);
  }, []);

  const value = useMemo(
    () => ({ active, openModal, closeModal }),
    [active, openModal, closeModal]
  );

  return (
    <DashboardModalsContext.Provider value={value}>
      {children}
    </DashboardModalsContext.Provider>
  );
}

export function useDashboardModals(): Ctx {
  const ctx = useContext(DashboardModalsContext);
  if (!ctx) {
    throw new Error("useDashboardModals must be used within DashboardModalsProvider");
  }
  return ctx;
}

"use client";

import { ModalShell } from "@/components/modals/ModalShell";
import { useDashboardModals } from "@/contexts/dashboard-modals-context";

const tiles = [
  {
    id: "add-property" as const,
    icon: "🏢",
    name: "Property",
    desc: "Add a building or complex",
  },
  {
    id: "onboard-tenant" as const,
    icon: "👤",
    name: "Tenant",
    desc: "Onboard a new renter",
  },
  {
    id: "record-payment" as const,
    icon: "💳",
    name: "Payment",
    desc: "Record a rent payment",
  },
  {
    id: "log-maintenance" as const,
    icon: "🔧",
    name: "Maintenance",
    desc: "Log a repair request",
  },
];

export function QuickAddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openModal } = useDashboardModals();

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="What would you like to add?"
      widthClassName="max-w-[460px]"
      paddingBodyClassName="p-6"
    >
      <div className="grid grid-cols-2 gap-4">
        {tiles.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => openModal(t.id)}
            className="flex cursor-pointer flex-col items-start rounded-[10px] border border-loom-border bg-loom-surface p-4 text-left shadow-loom-xs transition hover:border-loom-blue-500 hover:bg-loom-blue-50"
          >
            <span className="mb-2 text-2xl">{t.icon}</span>
            <span className="text-[14px] font-bold text-loom-text-900">{t.name}</span>
            <span className="mt-1 text-[12.5px] text-loom-text-500">{t.desc}</span>
          </button>
        ))}
      </div>
    </ModalShell>
  );
}

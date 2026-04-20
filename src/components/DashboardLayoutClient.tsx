"use client";

import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DashboardModalsHost } from "@/components/modals/DashboardModalsHost";
import { DashboardModalsProvider } from "@/contexts/dashboard-modals-context";
import { DashboardShellProvider } from "@/contexts/dashboard-shell-context";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShellProvider>
      <DashboardModalsProvider>
        <div className="min-h-screen overflow-x-hidden bg-loom-bg font-sans text-[14px] leading-normal text-loom-text-900 antialiased md:text-[14px]">
          <Sidebar />
          <div className="flex min-h-screen flex-col pb-[calc(56px+env(safe-area-inset-bottom))] md:ml-[76px] md:pb-0 xl:ml-[252px]">
            <Topbar />
            <main className="flex-1 p-4 sm:p-5 md:p-7">{children}</main>
          </div>
          <MobileBottomNav />
        </div>
        <DashboardModalsHost />
      </DashboardModalsProvider>
    </DashboardShellProvider>
  );
}

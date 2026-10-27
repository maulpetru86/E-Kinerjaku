"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { ActivePeriodProvider } from "@/contexts/active-period-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ActivePeriodProvider>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </ActivePeriodProvider>
  );
}

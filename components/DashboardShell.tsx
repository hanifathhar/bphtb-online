"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-rose-700 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active={active}
      />

      {/* Main Content Area */}
      <div className="md:pl-72 flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

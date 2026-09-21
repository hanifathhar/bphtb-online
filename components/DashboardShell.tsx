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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-rose-700 selection:text-white print:min-h-0 print:bg-white print:p-0 print:m-0">
      {/* Sidebar Navigation */}
      <div className="print:hidden">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          active={active}
        />
      </div>

      {/* Main Content Area */}
      <div className="md:pl-72 print:pl-0 flex-1 flex flex-col min-w-0 print:w-full print:max-w-none print:m-0 print:p-0">
        <div className="print:hidden">
          <Header
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            setSidebarOpen={setSidebarOpen}
          />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none print:w-full print:space-y-0">
          {children}
        </main>
      </div>
    </div>
  );
}

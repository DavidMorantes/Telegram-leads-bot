import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="lg:ml-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

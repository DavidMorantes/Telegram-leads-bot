import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Target,
  FileText,
  Users,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../../lib/cn";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/bots", label: "Bots", icon: Bot },
  { to: "/icps", label: "ICPs", icon: Target },
  { to: "/prompts", label: "Prompts", icon: FileText },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/settings", label: "Configuración", icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-teal-700">Control Center</p>
              <h1 className="mt-1 text-lg font-semibold text-slate-900">Lead Qualifier</h1>
            </div>
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-teal-50 text-teal-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-400">
              v0.1.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

import { useAuth } from "../../auth/AuthProvider";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-slate-500 sm:inline">{user?.username ?? "Admin"}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-800">
          {(user?.username?.[0] ?? "A").toUpperCase()}
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Salir
        </button>
      </div>
    </header>
  );
}

import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "Sin resultados",
  description = "No hay elementos para mostrar en este momento.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
      <div className="rounded-full bg-slate-100 p-3">
        <Inbox className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-slate-900">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

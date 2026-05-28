import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, backTo, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {backTo && (
          <Link
            to={backTo}
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        )}
        <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

import type { ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, Target, Users, AlertCircle, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { leadsApi } from "../api/leads.api";
import { botsApi } from "../api/bots.api";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";

type StatIcon = ComponentType<{ className?: string }>;

function StatCard({
  icon: Icon,
  title,
  value,
  tone = "default",
}: {
  icon: StatIcon;
  title: string;
  value: string | number;
  tone?: "default" | "success" | "danger" | "warning";
}) {
  const toneStyles = {
    default: "bg-white border-slate-200",
    success: "bg-emerald-50 border-emerald-200",
    danger: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
  };

  return (
    <div className={`rounded-2xl border p-5 ${toneStyles[tone]}`}>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-white p-2 shadow-sm">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const leadsQuery = useQuery({
    queryKey: ["leads"],
    queryFn: leadsApi.list,
    retry: 1,
  });

  const botsQuery = useQuery({
    queryKey: ["bots"],
    queryFn: botsApi.list,
    retry: 1,
  });

  const isLoading = leadsQuery.isLoading || botsQuery.isLoading;
  const isError = leadsQuery.isError || botsQuery.isError;

  const leads = leadsQuery.data?.results ?? [];
  const bots = botsQuery.data?.results ?? [];

  const qualified = leads.filter((l) => l.decision === "qualified").length;
  const notQualified = leads.filter((l) => l.decision === "not_qualified").length;
  const uncertain = leads.filter((l) => l.decision === "uncertain").length;
  const failed = leads.filter((l) => l.decision === "failed").length;
  const activeBots = bots.filter((b) => b.is_active).length;

  // Placeholder para errores de logging (no hay endpoint aún)
  const logErrors = 0;

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => { leadsQuery.refetch(); botsQuery.refetch(); }} />;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-teal-700">Overview</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">Dashboard</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Resumen operativo del sistema de cualificación de leads por Telegram.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Users} title="Total leads" value={leads.length} />
        <StatCard icon={CheckCircle2} title="Cualificados" value={qualified} tone="success" />
        <StatCard icon={XCircle} title="No cualificados" value={notQualified} tone="danger" />
        <StatCard icon={HelpCircle} title="Inciertos" value={uncertain} tone="warning" />
        <StatCard icon={Bot} title="Bots activos" value={activeBots} />
        <StatCard icon={AlertCircle} title="Errores de logging" value={logErrors} tone="danger" />
      </div>

      {leads.length === 0 && bots.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Primeros pasos</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            1. Configura un proveedor LLM en <strong>Configuración</strong>.<br />
            2. Crea un <strong>Bot</strong> de Telegram y vincúlalo.<br />
            3. Define un <strong>ICP</strong> con reglas de negocio.<br />
            4. Activa el bot y comienza a recibir leads.
          </p>
        </div>
      )}
    </section>
  );
}

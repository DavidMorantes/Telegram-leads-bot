import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { leadsApi } from "../api/leads.api";
import { PageHeader } from "../components/common/PageHeader";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { LeadDecisionBadge } from "../components/leads/LeadDecisionBadge";

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();

  const query = useQuery({
    queryKey: ["leads", Number(id)],
    queryFn: () => leadsApi.get(Number(id)),
    enabled: Boolean(id),
    retry: 1,
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;

  const lead = query.data;
  if (!lead) return <ErrorState message="Lead no encontrado." />;

  return (
    <section className="space-y-6">
      <PageHeader title={`Lead #${lead.id}`} backTo="/leads" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Mensaje original
            </h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
              {lead.raw_text}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Razón de la decisión
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-800">{lead.reason}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Datos extraídos
            </h3>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
              {JSON.stringify(lead.extracted_data, null, 2)}
            </pre>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Resumen
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Decisión</span>
                <LeadDecisionBadge decision={lead.decision} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Confianza</span>
                <span className="font-medium text-slate-900">
                  {lead.confidence ? `${parseFloat(lead.confidence).toFixed(2)}` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Bot</span>
                <span className="font-medium text-slate-900">{lead.bot}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">ICP</span>
                <span className="font-medium text-slate-900">{lead.icp ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Sheet status</span>
                <span className="font-medium capitalize text-slate-900">{lead.sheet_status}</span>
              </div>
              {lead.sheet_url && (
                <a
                  href={lead.sheet_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir Google Sheet
                </a>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fecha</span>
                <span className="font-medium text-slate-900">
                  {new Date(lead.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Datos técnicos LLM
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Proveedor</span>
                <span className="font-medium text-slate-900">{lead.llm_provider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Modelo</span>
                <span className="font-medium text-slate-900">{lead.llm_model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Input tokens</span>
                <span className="font-medium text-slate-900">{lead.input_tokens}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Output tokens</span>
                <span className="font-medium text-slate-900">{lead.output_tokens}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Costo estimado</span>
                <span className="font-medium text-slate-900">
                  {lead.estimated_cost ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

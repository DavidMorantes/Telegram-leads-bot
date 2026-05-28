import { Link } from "react-router-dom";
import { ExternalLink, Eye, Trash2 } from "lucide-react";
import type { Lead } from "../../types/lead";
import { LeadDecisionBadge } from "./LeadDecisionBadge";
import { StatusBadge } from "../common/StatusBadge";

interface LeadsTableProps {
  leads: Lead[];
  onDelete?: (lead: Lead) => void;
}

export function LeadsTable({ leads, onDelete }: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-500">
        No hay leads registrados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Bot</th>
            <th className="px-4 py-3 font-medium">Decisión</th>
            <th className="px-4 py-3 font-medium">Confianza</th>
            <th className="px-4 py-3 font-medium">Mensaje</th>
            <th className="px-4 py-3 font-medium">Sheet</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                {new Date(lead.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-slate-900 font-medium">{lead.bot}</td>
              <td className="px-4 py-3">
                <LeadDecisionBadge decision={lead.decision} />
              </td>
              <td className="px-4 py-3 text-slate-600">
                {lead.confidence ? `${parseFloat(lead.confidence).toFixed(2)}` : "—"}
              </td>
              <td className="px-4 py-3 text-slate-600 max-w-xs">
                <span className="line-clamp-1">{lead.raw_text}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    active={lead.sheet_status === "success"}
                    activeLabel="OK"
                    inactiveLabel={lead.sheet_status}
                  />
                  {lead.sheet_url && (
                    <a
                      href={lead.sheet_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Hoja
                    </a>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/leads/${lead.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(lead)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

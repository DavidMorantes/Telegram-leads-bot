import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import type { Icp } from "../../types/icp";
import { StatusBadge } from "../common/StatusBadge";

interface IcpsTableProps {
  icps: Icp[];
  onDelete?: (icp: Icp) => void;
}

export function IcpsTable({ icps, onDelete }: IcpsTableProps) {
  if (icps.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-500">
        No hay ICPs registrados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Descripción</th>
            <th className="px-4 py-3 font-medium">Empleados mín.</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Prompts</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {icps.map((icp) => (
            <tr key={icp.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 font-medium text-slate-900">{icp.name}</td>
              <td className="px-4 py-3 text-slate-600">
                <span className="line-clamp-1 max-w-xs">{icp.description}</span>
              </td>
              <td className="px-4 py-3 text-slate-600">{icp.min_employees ?? "—"}</td>
              <td className="px-4 py-3">
                <StatusBadge active={icp.is_active} />
              </td>
              <td className="px-4 py-3 text-slate-600">{icp.prompt_templates?.length ?? 0}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/icps/${icp.id}/edit`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(icp)}
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

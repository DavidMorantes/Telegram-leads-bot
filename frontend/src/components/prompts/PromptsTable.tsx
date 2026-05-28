import { Pencil, Trash2 } from "lucide-react";

import { StatusBadge } from "../common/StatusBadge";
import type { PromptTemplate } from "../../types/icp";

interface PromptsTableProps {
  prompts: PromptTemplate[];
  icpNameById: Record<number, string>;
  selectedPromptId?: number | null;
  onEdit: (prompt: PromptTemplate) => void;
  onDelete?: (prompt: PromptTemplate) => void;
}

export function PromptsTable({
  prompts,
  icpNameById,
  selectedPromptId,
  onEdit,
  onDelete,
}: PromptsTableProps) {
  if (prompts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-500">
        No hay prompts registrados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">ICP</th>
            <th className="px-4 py-3 font-medium">Version</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Prompt</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {prompts.map((prompt) => {
            const isSelected = selectedPromptId === prompt.id;
            return (
              <tr key={prompt.id} className={isSelected ? "bg-teal-50/40" : "hover:bg-slate-50/50"}>
                <td className="px-4 py-3 font-medium text-slate-900">{prompt.name}</td>
                <td className="px-4 py-3 text-slate-600">{icpNameById[prompt.icp] ?? `ICP #${prompt.icp}`}</td>
                <td className="px-4 py-3 text-slate-600">{prompt.version}</td>
                <td className="px-4 py-3">
                  <StatusBadge active={prompt.is_active} />
                </td>
                <td className="max-w-md px-4 py-3 text-slate-600">
                  <span className="line-clamp-1">{prompt.system_prompt}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(prompt)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(prompt)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

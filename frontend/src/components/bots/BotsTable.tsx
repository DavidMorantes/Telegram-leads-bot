import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import type { Bot } from "../../types/bot";
import { BotStatusBadge } from "./BotStatusBadge";
import { cn } from "../../lib/cn";

interface BotsTableProps {
  bots: Bot[];
  onDelete?: (bot: Bot) => void;
}

export function BotsTable({ bots, onDelete }: BotsTableProps) {
  if (bots.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-500">
        No hay bots registrados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Username</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">ICP</th>
            <th className="px-4 py-3 font-medium">Creado</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bots.map((bot) => (
            <tr key={bot.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 font-medium text-slate-900">{bot.name}</td>
              <td className="px-4 py-3 text-slate-600">@{bot.telegram_username}</td>
              <td className="px-4 py-3">
                <BotStatusBadge isActive={bot.is_active} />
              </td>
              <td className="px-4 py-3 text-slate-600">
                {bot.default_icp ?? "—"}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {new Date(bot.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/bots/${bot.id}/edit`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(bot)}
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

import { useState } from "react";
import { AlertTriangle, Save } from "lucide-react";
import { cn } from "../../lib/cn";
import type { PromptTemplate, PromptTemplatePayload } from "../../types/icp";

interface PromptEditorProps {
  prompt: PromptTemplate;
  onSave: (id: number, data: PromptTemplatePayload) => Promise<void>;
}

export function PromptEditor({ prompt, onSave }: PromptEditorProps) {
  const [systemPrompt, setSystemPrompt] = useState(prompt.system_prompt);
  const [name, setName] = useState(prompt.name);
  const [version, setVersion] = useState(prompt.version);
  const [isActive, setIsActive] = useState(prompt.is_active);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(prompt.id, {
        icp: prompt.icp,
        name,
        system_prompt: systemPrompt,
        output_schema: prompt.output_schema,
        version,
        is_active: isActive,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-slate-700">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
        </div>
        <div className="w-32 space-y-2">
          <label className="text-sm font-medium text-slate-700">Versión</label>
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
        </div>
        <div className="flex items-center gap-3 pb-2.5">
          <input
            type="checkbox"
            id={`active-${prompt.id}`}
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
          />
          <label htmlFor={`active-${prompt.id}`} className="text-sm font-medium text-slate-700">
            Activo
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-5 text-amber-800">
            Los cambios de prompt afectan la clasificación de nuevos leads. Recomendado versionar
            antes de activar.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">System prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className={cn(
            "min-h-[220px] w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600",
          )}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

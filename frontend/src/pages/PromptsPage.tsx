import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { icpsApi, promptsApi } from "../api/icps.api";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import { PromptEditor } from "../components/prompts/PromptEditor";
import { PromptsTable } from "../components/prompts/PromptsTable";
import { cn } from "../lib/cn";
import type { PromptTemplate, PromptTemplatePayload } from "../types/icp";

const DEFAULT_OUTPUT_SCHEMA = {
  decision: "qualified | not_qualified | uncertain | failed",
  reason: "short explanation",
  confidence: "number between 0 and 1",
  extracted_data: {},
};

export function PromptsPage() {
  const queryClient = useQueryClient();
  const [selectedIcpId, setSelectedIcpId] = useState<number | "">("");
  const [name, setName] = useState("Default qualification");
  const [version, setVersion] = useState("v1");
  const [systemPrompt, setSystemPrompt] = useState(
    "Classify the incoming Telegram lead against the selected ICP and return strict JSON.",
  );
  const [isActive, setIsActive] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromptTemplate | null>(null);

  const promptsQuery = useQuery({
    queryKey: ["prompts"],
    queryFn: promptsApi.list,
    retry: 1,
  });

  const icpsQuery = useQuery({
    queryKey: ["icps"],
    queryFn: icpsApi.list,
    retry: 1,
  });

  useEffect(() => {
    if (!selectedIcpId && icpsQuery.data?.results.length) {
      setSelectedIcpId(icpsQuery.data.results[0].id);
    }
  }, [icpsQuery.data, selectedIcpId]);

  const createMutation = useMutation({
    mutationFn: (payload: PromptTemplatePayload) => promptsApi.create(payload),
    onSuccess: (createdPrompt) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      setName("Default qualification");
      setVersion("v1");
      setSystemPrompt("Classify the incoming Telegram lead against the selected ICP and return strict JSON.");
      setIsActive(true);
      setSelectedPrompt(createdPrompt);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PromptTemplatePayload }) => promptsApi.update(id, data),
    onSuccess: (updatedPrompt) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      setSelectedPrompt(updatedPrompt);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => promptsApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(null);
      }
      setDeleteTarget(null);
    },
  });

  const prompts = promptsQuery.data?.results ?? [];
  const icps = icpsQuery.data?.results ?? [];
  const icpNameById = useMemo(
    () =>
      Object.fromEntries(icps.map((icp) => [icp.id, icp.name])) as Record<number, string>,
    [icps],
  );
  const inputBase =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600";
  const textareaBase = cn(inputBase, "min-h-[180px] resize-y font-mono");

  if (promptsQuery.isLoading || icpsQuery.isLoading) return <LoadingState />;
  if (promptsQuery.isError) return <ErrorState onRetry={() => promptsQuery.refetch()} />;
  if (icpsQuery.isError) return <ErrorState onRetry={() => icpsQuery.refetch()} />;

  const handleCreate = async () => {
    if (!selectedIcpId) {
      return;
    }

    await createMutation.mutateAsync({
      icp: Number(selectedIcpId),
      name,
      system_prompt: systemPrompt,
      output_schema: DEFAULT_OUTPUT_SCHEMA,
      version,
      is_active: isActive,
    });
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Prompts"
        subtitle="Edita y crea los system prompts usados para la clasificacion de leads."
      />

      {icps.length === 0 ? (
        <EmptyState
          title="Sin ICPs"
          description="Primero crea al menos un ICP para poder asociarle prompts."
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Nuevo prompt</h3>
            <p className="text-sm text-slate-600">
              Crea un prompt asociado a uno de tus ICPs. Luego podras editarlo y versionarlo.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">ICP asociado</label>
              <select
                value={selectedIcpId}
                onChange={(e) => setSelectedIcpId(e.target.value ? Number(e.target.value) : "")}
                className={inputBase}
              >
                {icps.map((icp) => (
                  <option key={icp.id} value={icp.id}>
                    {icp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputBase} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Version</label>
              <input value={version} onChange={(e) => setVersion(e.target.value)} className={inputBase} />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Prompt activo
            </label>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">System prompt</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className={textareaBase}
              />
            </div>
          </div>

          {createMutation.isError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {createMutation.error instanceof Error ? createMutation.error.message : "No fue posible crear el prompt."}
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending || !selectedIcpId}
              className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {createMutation.isPending ? "Creando..." : "Crear prompt"}
            </button>
          </div>
        </div>
      )}

      {prompts.length === 0 && icps.length > 0 ? (
        <EmptyState
          title="Sin prompts"
          description="Ya tienes ICPs creados. Usa el formulario de arriba para crear el primer prompt asociado."
        />
      ) : (
        <>
          <PromptsTable
            prompts={prompts}
            icpNameById={icpNameById}
            selectedPromptId={selectedPrompt?.id ?? null}
            onEdit={(prompt) => setSelectedPrompt(prompt)}
            onDelete={(prompt) => setDeleteTarget(prompt)}
          />

          {selectedPrompt && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Editar prompt</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Ajusta el prompt seleccionado y guarda los cambios.
                </p>
              </div>
              <PromptEditor
                prompt={selectedPrompt}
                onSave={(id, data) => updateMutation.mutateAsync({ id, data }).then(() => {})}
              />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar prompt"
        description={`Eliminar el prompt "${deleteTarget?.name}"?`}
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { botsApi } from "../api/bots.api";
import { PageHeader } from "../components/common/PageHeader";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { BotsTable } from "../components/bots/BotsTable";
import type { Bot } from "../types/bot";

export function BotsPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Bot | null>(null);

  const query = useQuery({
    queryKey: ["bots"],
    queryFn: botsApi.list,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => botsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      setDeleteTarget(null);
    },
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;

  const bots = query.data?.results ?? [];

  return (
    <section className="space-y-6">
      <PageHeader
        title="Bots"
        subtitle="Gestiona los bots de Telegram conectados al sistema."
        action={
          <Link
            to="/bots/new"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
          >
            <Plus className="h-4 w-4" />
            Nuevo bot
          </Link>
        }
      />

      <BotsTable bots={bots} onDelete={(bot) => setDeleteTarget(bot)} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar bot"
        description={`¿Estás seguro de eliminar el bot "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}

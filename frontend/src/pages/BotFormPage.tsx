import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { botsApi } from "../api/bots.api";
import { PageHeader } from "../components/common/PageHeader";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { BotForm } from "../components/bots/BotForm";
import type { BotPayload } from "../types/bot";

export function BotFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["bots", Number(id)],
    queryFn: () => botsApi.get(Number(id)),
    enabled: isEdit,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: botsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bots"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BotPayload }) => botsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bots"] }),
  });

  const handleSubmit = async (data: BotPayload) => {
    if (isEdit && id) {
      await updateMutation.mutateAsync({ id: Number(id), data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  if (isEdit && query.isLoading) return <LoadingState />;
  if (isEdit && query.isError) return <ErrorState onRetry={() => query.refetch()} />;

  return (
    <section className="space-y-6">
      <PageHeader
        title={isEdit ? "Editar bot" : "Nuevo bot"}
        subtitle="Configura el bot de Telegram, su token y relaciones."
        backTo="/bots"
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <BotForm initial={query.data} onSubmit={handleSubmit} />
      </div>
    </section>
  );
}

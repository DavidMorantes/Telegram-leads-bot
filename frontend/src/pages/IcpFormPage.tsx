import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { icpsApi } from "../api/icps.api";
import { PageHeader } from "../components/common/PageHeader";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { IcpForm } from "../components/icps/IcpForm";
import type { IcpPayload } from "../types/icp";

export function IcpFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["icps", Number(id)],
    queryFn: () => icpsApi.get(Number(id)),
    enabled: isEdit,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: icpsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["icps"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: IcpPayload }) => icpsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["icps"] }),
  });

  const handleSubmit = async (data: IcpPayload) => {
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
        title={isEdit ? "Editar ICP" : "Nuevo ICP"}
        subtitle="Define el perfil ideal, reglas y criterios de cualificación."
        backTo="/icps"
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <IcpForm initial={query.data} onSubmit={handleSubmit} />
      </div>
    </section>
  );
}

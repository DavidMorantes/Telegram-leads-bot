import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { icpsApi } from "../api/icps.api";
import { PageHeader } from "../components/common/PageHeader";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { IcpsTable } from "../components/icps/IcpsTable";
import type { Icp } from "../types/icp";

export function IcpsPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Icp | null>(null);

  const query = useQuery({
    queryKey: ["icps"],
    queryFn: icpsApi.list,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => icpsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["icps"] });
      setDeleteTarget(null);
    },
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;

  const icps = query.data?.results ?? [];

  return (
    <section className="space-y-6">
      <PageHeader
        title="ICPs"
        subtitle="Perfiles de cliente ideal, reglas de exclusión y criterios de cualificación."
        action={
          <Link
            to="/icps/new"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
          >
            <Plus className="h-4 w-4" />
            Nuevo ICP
          </Link>
        }
      />

      <IcpsTable icps={icps} onDelete={(icp) => setDeleteTarget(icp)} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar ICP"
        description={`¿Estás seguro de eliminar el ICP "${deleteTarget?.name}"?`}
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}

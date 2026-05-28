import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "../api/leads.api";
import type { Lead } from "../types/lead";
import { PageHeader } from "../components/common/PageHeader";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { LeadsTable } from "../components/leads/LeadsTable";

export function LeadsPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const query = useQuery({
    queryKey: ["leads"],
    queryFn: leadsApi.list,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => leadsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setDeleteTarget(null);
    },
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;

  const leads = query.data?.results ?? [];

  return (
    <section className="space-y-6">
      <PageHeader
        title="Leads"
        subtitle="Historial de leads recibidos, decisiones del LLM y estado de sincronización."
      />
      <LeadsTable leads={leads} onDelete={(lead) => setDeleteTarget(lead)} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar lead"
        description={`Eliminar el lead #${deleteTarget?.id}?`}
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}

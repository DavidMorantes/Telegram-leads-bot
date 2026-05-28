import { useState, type ComponentType } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Cpu, Pencil, Sheet, Shield, Trash2, Users } from "lucide-react";
import { z } from "zod";

import { llmApi } from "../api/llm.api";
import { sheetsApi } from "../api/sheets.api";
import { usersApi } from "../api/users.api";
import { useAuth } from "../auth/AuthProvider";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { LLMProviderForm } from "../components/settings/LLMProviderForm";
import { SheetConfigForm } from "../components/settings/SheetConfigForm";
import { cn } from "../lib/cn";
import type { AuthUser, UserCreatePayload } from "../types/auth";
import type { LLMProviderConfig } from "../types/llm";
import type { SheetConfig } from "../types/sheet";

type TabKey = "llm" | "sheets" | "security" | "users";
type TabIcon = ComponentType<{ className?: string }>;

const userSchema = z.object({
  username: z.string().min(3, "Minimo 3 caracteres"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email("Correo invalido"),
  password: z.string().min(8, "Minimo 8 caracteres"),
  is_staff: z.boolean(),
  is_active: z.boolean(),
});

type UserFormValues = z.infer<typeof userSchema>;

function UserCreationCard() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      is_staff: false,
      is_active: true,
    },
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.list,
    retry: 1,
  });

  const createUser = useMutation({
    mutationFn: (payload: UserCreatePayload) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        is_staff: false,
        is_active: true,
      });
    },
  });

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-900">Crear usuario</h3>
        <p className="mt-2 text-sm text-slate-600">
          Solo los usuarios administradores pueden crear nuevas cuentas. Cada usuario ve unicamente sus propios datos.
        </p>

        <form
          className="mt-5 grid gap-4 md:grid-cols-2"
          onSubmit={handleSubmit((values) => createUser.mutate(values))}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Username</label>
            <input {...register("username")} className={cn(inputClass, errors.username && "border-red-300")} />
            {errors.username && <p className="text-xs text-red-600">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input {...register("email")} className={cn(inputClass, errors.email && "border-red-300")} />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nombre</label>
            <input {...register("first_name")} className={inputClass} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Apellido</label>
            <input {...register("last_name")} className={inputClass} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Password inicial</label>
            <input
              type="password"
              {...register("password")}
              className={cn(inputClass, errors.password && "border-red-300")}
            />
            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...register("is_staff")} className="h-4 w-4 rounded border-slate-300" />
            Crear como administrador
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...register("is_active")} className="h-4 w-4 rounded border-slate-300" />
            Usuario activo
          </label>

          {createUser.isError && (
            <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {createUser.error instanceof Error ? createUser.error.message : "No fue posible crear el usuario."}
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting || createUser.isPending}
              className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {createUser.isPending ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-900">Usuarios existentes</h3>
        {usersQuery.isLoading ? (
          <div className="mt-4">
            <LoadingState />
          </div>
        ) : usersQuery.isError ? (
          <div className="mt-4">
            <ErrorState onRetry={() => usersQuery.refetch()} />
          </div>
        ) : usersQuery.data?.results.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Sin usuarios" description="Todavia no se han creado usuarios adicionales." />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {usersQuery.data?.results.map((account: AuthUser) => (
              <div key={account.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{account.username}</p>
                    <p className="text-xs text-slate-500">
                      {account.email || "Sin correo"} · {account.is_staff ? "Administrador" : "Usuario"} ·{" "}
                      {account.is_active ? "Activo" : "Inactivo"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("llm");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const llmQuery = useQuery({
    queryKey: ["llm-providers"],
    queryFn: llmApi.list,
    retry: 1,
  });

  const sheetsQuery = useQuery({
    queryKey: ["sheet-configs"],
    queryFn: sheetsApi.list,
    retry: 1,
  });

  const llmCreate = useMutation({
    mutationFn: llmApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["llm-providers"] }),
  });

  const sheetCreate = useMutation({
    mutationFn: sheetsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sheet-configs"] }),
  });

  const [editingLlm, setEditingLlm] = useState<LLMProviderConfig | null>(null);
  const [editingSheet, setEditingSheet] = useState<SheetConfig | null>(null);
  const [deleteLlm, setDeleteLlm] = useState<LLMProviderConfig | null>(null);
  const [deleteSheet, setDeleteSheet] = useState<SheetConfig | null>(null);

  const llmUpdate = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof llmApi.update>[1] }) =>
      llmApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] });
      setEditingLlm(null);
    },
  });

  const sheetUpdate = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof sheetsApi.update>[1] }) =>
      sheetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sheet-configs"] });
      setEditingSheet(null);
    },
  });

  const llmDelete = useMutation({
    mutationFn: (id: number) => llmApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] });
      if (editingLlm?.id === deleteLlm?.id) {
        setEditingLlm(null);
      }
      setDeleteLlm(null);
    },
  });

  const sheetDelete = useMutation({
    mutationFn: (id: number) => sheetsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sheet-configs"] });
      if (editingSheet?.id === deleteSheet?.id) {
        setEditingSheet(null);
      }
      setDeleteSheet(null);
    },
  });

  const tabs: { key: TabKey; label: string; icon: TabIcon; show?: boolean }[] = [
    { key: "llm", label: "Proveedor IA", icon: Cpu, show: true },
    { key: "sheets", label: "Google Sheets", icon: Sheet, show: true },
    { key: "security", label: "Seguridad", icon: Shield, show: true },
    { key: "users", label: "Usuarios", icon: Users, show: Boolean(user?.is_staff) },
  ];

  return (
    <section className="space-y-6">
      <PageHeader title="Configuracion" subtitle="Gestiona proveedores, credenciales, seguridad y usuarios." />

      <div className="flex gap-2 border-b border-slate-200">
        {tabs
          .filter((item) => item.show)
          .map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                tab === t.key
                  ? "border-teal-700 text-teal-800"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
      </div>

      {tab === "llm" && (
        <div className="space-y-6">
          {llmQuery.isLoading ? (
            <LoadingState />
          ) : llmQuery.isError ? (
            <ErrorState onRetry={() => llmQuery.refetch()} />
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-slate-900">Nuevo proveedor</h3>
                <div className="mt-4">
                  <LLMProviderForm onSubmit={(data) => llmCreate.mutateAsync(data).then(() => {})} />
                </div>
              </div>

              {llmQuery.data?.results.length === 0 ? (
                <EmptyState title="Sin proveedores" description="Crea tu primer proveedor LLM arriba." />
              ) : (
                <div className="space-y-4">
                  {llmQuery.data?.results.map((provider) => (
                    <div key={provider.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">{provider.name}</h4>
                          <p className="text-xs text-slate-500">
                            {provider.provider} · {provider.model} · {provider.is_active ? "Activo" : "Inactivo"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingLlm(editingLlm?.id === provider.id ? null : provider)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {editingLlm?.id === provider.id ? "Cerrar" : "Editar"}
                          </button>
                          <button
                            onClick={() => setDeleteLlm(provider)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                      {editingLlm?.id === provider.id && (
                        <div className="mt-5 border-t border-slate-100 pt-5">
                          <LLMProviderForm
                            key={`llm-edit-${provider.id}`}
                            initial={provider}
                            onSubmit={(data) => llmUpdate.mutateAsync({ id: provider.id, data }).then(() => {})}
                          />
                          {llmUpdate.isError && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                              {llmUpdate.error instanceof Error
                                ? llmUpdate.error.message
                                : "No fue posible actualizar el proveedor."}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "sheets" && (
        <div className="space-y-6">
          {sheetsQuery.isLoading ? (
            <LoadingState />
          ) : sheetsQuery.isError ? (
            <ErrorState onRetry={() => sheetsQuery.refetch()} />
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-slate-900">Nueva configuracion</h3>
                <div className="mt-4">
                  <SheetConfigForm onSubmit={(data) => sheetCreate.mutateAsync(data).then(() => {})} />
                </div>
              </div>

              {sheetsQuery.data?.results.length === 0 ? (
                <EmptyState title="Sin configuraciones" description="Crea tu primera configuracion de Sheets arriba." />
              ) : (
                <div className="space-y-4">
                  {sheetsQuery.data?.results.map((cfg) => (
                    <div key={cfg.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">{cfg.name}</h4>
                          <p className="text-xs text-slate-500">
                            {cfg.spreadsheet_id} · {cfg.worksheet_name} · {cfg.is_active ? "Activa" : "Inactiva"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingSheet(editingSheet?.id === cfg.id ? null : cfg)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {editingSheet?.id === cfg.id ? "Cerrar" : "Editar"}
                          </button>
                          <button
                            onClick={() => setDeleteSheet(cfg)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                      {editingSheet?.id === cfg.id && (
                        <div className="mt-5 border-t border-slate-100 pt-5">
                          <SheetConfigForm
                            key={`sheet-edit-${cfg.id}`}
                            initial={cfg}
                            onSubmit={(data) => sheetUpdate.mutateAsync({ id: cfg.id, data }).then(() => {})}
                          />
                          {sheetUpdate.isError && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                              {sheetUpdate.error instanceof Error
                                ? sheetUpdate.error.message
                                : "No fue posible actualizar la configuracion."}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "security" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900">Seguridad y acceso</h3>
          <p className="mt-2 text-sm text-slate-600">
            El panel ya usa autenticacion JWT para usuarios activos. Los administradores pueden crear otros usuarios y
            cada cuenta solo ve sus propios datos.
          </p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Implementado: login JWT con access token corto y refresh token.</li>
            <li>Implementado: aislamiento por usuario en bots, ICPs, prompts, leads y configuraciones.</li>
            <li>Implementado: alta de usuarios desde la UI solo para administradores.</li>
            <li>Implementado: auditoria de login.</li>
            <li>Pendiente: roles mas finos y endurecimiento con cookies HttpOnly si luego migramos el esquema.</li>
          </ul>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Sesion actual</p>
            <p className="mt-2">Username: {user?.username ?? "N/D"}</p>
            <p>Rol: {user?.is_staff ? "Administrador" : "Usuario"}</p>
            <p>Estado: {user?.is_active ? "Activo" : "Inactivo"}</p>
            <p className="mt-3 text-xs text-slate-500">
              Baseline OWASP aplicado: minimo privilegio, autenticacion obligatoria, separacion de datos por usuario y
              mensajes de error acotados.
            </p>
          </div>
        </div>
      )}

      {tab === "users" && user?.is_staff && <UserCreationCard />}

      <ConfirmDialog
        open={!!deleteLlm}
        title="Eliminar proveedor"
        description={`Eliminar el proveedor "${deleteLlm?.name}"?`}
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={() => deleteLlm && llmDelete.mutate(deleteLlm.id)}
        onCancel={() => setDeleteLlm(null)}
      />

      <ConfirmDialog
        open={!!deleteSheet}
        title="Eliminar configuracion"
        description={`Eliminar la configuracion "${deleteSheet?.name}"?`}
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={() => deleteSheet && sheetDelete.mutate(deleteSheet.id)}
        onCancel={() => setDeleteSheet(null)}
      />
    </section>
  );
}

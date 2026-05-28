import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import type { Bot, BotPayload } from "../../types/bot";
import { cn } from "../../lib/cn";

const botSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  telegram_username: z.string().min(1, "El username es requerido"),
  telegram_token: z.string().optional(),
  is_active: z.boolean(),
  default_icp: z.number().nullable().optional(),
  llm_provider_config: z.number().nullable().optional(),
  sheet_config: z.number().nullable().optional(),
});

type BotFormData = z.infer<typeof botSchema>;

interface BotFormProps {
  initial?: Bot;
  onSubmit: (data: BotPayload) => Promise<void>;
}

export function BotForm({ initial, onSubmit }: BotFormProps) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BotFormData>({
    resolver: zodResolver(botSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          telegram_username: initial.telegram_username,
          telegram_token: "",
          is_active: initial.is_active,
          default_icp: initial.default_icp ?? null,
          llm_provider_config: initial.llm_provider_config ?? null,
          sheet_config: initial.sheet_config ?? null,
        }
      : {
          telegram_token: "",
          is_active: true,
          default_icp: null,
          llm_provider_config: null,
          sheet_config: null,
        },
  });

  const handleFormSubmit = async (data: BotFormData) => {
    if (!initial && !data.telegram_token) {
      setError("telegram_token", { message: "El token es requerido" });
      return;
    }

    await onSubmit(data as BotPayload);
    navigate("/bots");
  };

  const inputBase =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Nombre</label>
          <input {...register("name")} className={cn(inputBase, errors.name && "border-red-300")} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Username de Telegram</label>
          <input
            {...register("telegram_username")}
            className={cn(inputBase, errors.telegram_username && "border-red-300")}
          />
          {errors.telegram_username && (
            <p className="text-xs text-red-600">{errors.telegram_username.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Token de Telegram</label>
          <input
            type="password"
            {...register("telegram_token")}
            className={cn(inputBase, errors.telegram_token && "border-red-300")}
          />
          {errors.telegram_token && (
            <p className="text-xs text-red-600">{errors.telegram_token.message}</p>
          )}
          <p className="text-xs text-slate-500">
            {initial?.telegram_token_masked
              ? `Token actual: ${initial.telegram_token_masked}. Completa este campo solo si deseas reemplazarlo.`
              : "Token sensible proporcionado por @BotFather. No se mostrara despues de guardar."}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">ICP por defecto (ID)</label>
          <input
            type="number"
            {...register("default_icp", { valueAsNumber: true })}
            className={inputBase}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Proveedor LLM (ID)</label>
          <input
            type="number"
            {...register("llm_provider_config", { valueAsNumber: true })}
            className={inputBase}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Configuracion Sheets (ID)</label>
          <input
            type="number"
            {...register("sheet_config", { valueAsNumber: true })}
            className={inputBase}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            {...register("is_active")}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
            Bot activo
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => navigate("/bots")}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : initial ? "Actualizar bot" : "Crear bot"}
        </button>
      </div>
    </form>
  );
}

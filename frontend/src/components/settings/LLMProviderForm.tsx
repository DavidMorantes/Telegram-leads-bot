import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";

import type { LLMProviderConfig, LLMProviderPayload } from "../../types/llm";
import { cn } from "../../lib/cn";

const schema = z.object({
  provider: z.string().min(1, "Requerido"),
  name: z.string().min(1, "Requerido"),
  model: z.string().min(1, "Requerido"),
  base_url: z.string().optional().nullable(),
  api_key: z.string().optional(),
  temperature: z.string().optional().nullable(),
  max_tokens: z.number().nullable().optional(),
  timeout_seconds: z.number().nullable().optional(),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface LLMProviderFormProps {
  initial?: LLMProviderConfig;
  onSubmit: (data: LLMProviderPayload) => Promise<void>;
}

export function LLMProviderForm({ initial, onSubmit }: LLMProviderFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          provider: initial.provider,
          name: initial.name,
          model: initial.model,
          base_url: initial.base_url,
          api_key: "",
          temperature: initial.temperature,
          max_tokens: initial.max_tokens ?? null,
          timeout_seconds: initial.timeout_seconds ?? null,
          is_active: initial.is_active,
        }
      : { is_active: true },
  });

  const inputBase =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600";

  const handleFormSubmit = async (data: FormData) => {
    if (!initial && !data.api_key) {
      setError("api_key", { message: "Requerido" });
      return;
    }
    await onSubmit(data as LLMProviderPayload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Proveedor</label>
          <input
            {...register("provider")}
            placeholder="groq, openai, anthropic..."
            className={cn(inputBase, errors.provider && "border-red-300")}
          />
          {errors.provider && <p className="text-xs text-red-600">{errors.provider.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Nombre</label>
          <input
            {...register("name")}
            placeholder="Groq Llama 3 70B"
            className={cn(inputBase, errors.name && "border-red-300")}
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Modelo</label>
          <input
            {...register("model")}
            placeholder="llama-3.1-70b-versatile"
            className={cn(inputBase, errors.model && "border-red-300")}
          />
          {errors.model && <p className="text-xs text-red-600">{errors.model.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Base URL (opcional)</label>
          <input {...register("base_url")} placeholder="https://api.groq.com/openai/v1" className={inputBase} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">API Key</label>
          <input
            type="password"
            {...register("api_key")}
            className={cn(inputBase, errors.api_key && "border-red-300")}
          />
          {errors.api_key && <p className="text-xs text-red-600">{errors.api_key.message}</p>}
          <p className="text-xs text-slate-500">
            {initial?.api_key_masked
              ? `Clave actual: ${initial.api_key_masked}. Ingresa una nueva solo si deseas reemplazarla.`
              : "La clave se almacena como secreto y no se vuelve a exponer en la API."}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Temperature</label>
          <input {...register("temperature")} placeholder="0.7" className={inputBase} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Max tokens</label>
          <input
            type="number"
            {...register("max_tokens", { valueAsNumber: true })}
            className={inputBase}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Timeout (segundos)</label>
          <input
            type="number"
            {...register("timeout_seconds", { valueAsNumber: true })}
            className={inputBase}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="llm_active"
            {...register("is_active")}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
          />
          <label htmlFor="llm_active" className="text-sm font-medium text-slate-700">
            Proveedor activo
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Guardando..." : initial ? "Actualizar proveedor" : "Crear proveedor"}
        </button>
      </div>
    </form>
  );
}

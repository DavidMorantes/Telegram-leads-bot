import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";

import type { SheetConfig, SheetConfigPayload } from "../../types/sheet";
import { cn } from "../../lib/cn";

const schema = z.object({
  name: z.string().min(1, "Requerido"),
  spreadsheet_id: z.string().min(1, "Requerido"),
  worksheet_name: z.string().min(1, "Requerido"),
  credentials_json: z.string().optional(),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface SheetConfigFormProps {
  initial?: SheetConfig;
  onSubmit: (data: SheetConfigPayload) => Promise<void>;
}

export function SheetConfigForm({ initial, onSubmit }: SheetConfigFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          name: initial.name,
          spreadsheet_id: initial.spreadsheet_id,
          worksheet_name: initial.worksheet_name,
          credentials_json: "",
          is_active: initial.is_active,
        }
      : { is_active: true },
  });

  const inputBase =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600";
  const textareaBase = cn(inputBase, "min-h-[120px] resize-y font-mono");

  const handleFormSubmit = async (data: FormData) => {
    if (!initial && !data.credentials_json) {
      setError("credentials_json", { message: "Requerido" });
      return;
    }
    await onSubmit(data as SheetConfigPayload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Nombre</label>
          <input
            {...register("name")}
            placeholder="Configuracion principal"
            className={cn(inputBase, errors.name && "border-red-300")}
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Spreadsheet ID</label>
          <input
            {...register("spreadsheet_id")}
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
            className={cn(inputBase, errors.spreadsheet_id && "border-red-300")}
          />
          {errors.spreadsheet_id && (
            <p className="text-xs text-red-600">{errors.spreadsheet_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Nombre de la hoja</label>
          <input
            {...register("worksheet_name")}
            placeholder="Leads"
            className={cn(inputBase, errors.worksheet_name && "border-red-300")}
          />
          {errors.worksheet_name && (
            <p className="text-xs text-red-600">{errors.worksheet_name.message}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="sheet_active"
            {...register("is_active")}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
          />
          <label htmlFor="sheet_active" className="text-sm font-medium text-slate-700">
            Configuracion activa
          </label>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Credenciales JSON (Service Account)</label>
          <textarea
            {...register("credentials_json")}
            placeholder={`{\n  "type": "service_account",\n  ...\n}`}
            className={cn(textareaBase, errors.credentials_json && "border-red-300")}
          />
          {errors.credentials_json && (
            <p className="text-xs text-red-600">{errors.credentials_json.message}</p>
          )}
          <p className="text-xs text-slate-500">
            {initial?.credentials_json_masked
              ? "Ya hay credenciales configuradas. Pega un nuevo JSON solo si deseas reemplazarlas."
              : "Las credenciales se envian solo al guardar y no vuelven a exponerse en la API."}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Guardando..." : initial ? "Actualizar" : "Crear configuracion"}
        </button>
      </div>
    </form>
  );
}

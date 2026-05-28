import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import type { Icp, IcpPayload } from "../../types/icp";
import { cn } from "../../lib/cn";

const icpSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripcion es requerida"),
  min_employees: z.number().nullable().optional(),
  allowed_regions: z.string().optional(),
  allowed_industries: z.string().optional(),
  required_interests: z.string().optional(),
  exclusion_rules: z.string().optional(),
  is_active: z.boolean(),
});

type IcpFormData = z.infer<typeof icpSchema>;

function arrayFromString(val?: string): string[] {
  if (!val) return [];
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function stringFromArray(arr?: string[]): string {
  return (arr ?? []).join(", ");
}

interface IcpFormProps {
  initial?: Icp;
  onSubmit: (data: IcpPayload) => Promise<void>;
}

export function IcpForm({ initial, onSubmit }: IcpFormProps) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IcpFormData>({
    resolver: zodResolver(icpSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          description: initial.description,
          min_employees: initial.min_employees ?? null,
          allowed_regions: stringFromArray(initial.allowed_regions),
          allowed_industries: stringFromArray(initial.allowed_industries),
          required_interests: stringFromArray(initial.required_interests),
          exclusion_rules: stringFromArray(initial.exclusion_rules),
          is_active: initial.is_active,
        }
      : {
          is_active: true,
        },
  });

  const handleFormSubmit = async (data: IcpFormData) => {
    const payload: IcpPayload = {
      name: data.name,
      description: data.description,
      min_employees: data.min_employees ?? null,
      allowed_regions: arrayFromString(data.allowed_regions),
      allowed_industries: arrayFromString(data.allowed_industries),
      required_interests: arrayFromString(data.required_interests),
      exclusion_rules: arrayFromString(data.exclusion_rules),
      is_active: data.is_active,
    };
    await onSubmit(payload);
    navigate("/icps");
  };

  const inputBase =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600";
  const textareaBase = cn(inputBase, "min-h-[80px] resize-y");

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Nombre</label>
          <input {...register("name")} className={cn(inputBase, errors.name && "border-red-300")} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Descripcion</label>
          <textarea
            {...register("description")}
            className={cn(textareaBase, errors.description && "border-red-300")}
          />
          {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Empleados minimos</label>
          <input
            type="number"
            {...register("min_employees", { valueAsNumber: true })}
            className={inputBase}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Regiones permitidas</label>
          <input
            {...register("allowed_regions")}
            placeholder="Latam, EMEA, NAM..."
            className={inputBase}
          />
          <p className="text-xs text-slate-500">Separadas por comas.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Industrias permitidas</label>
          <input
            {...register("allowed_industries")}
            placeholder="SaaS, Fintech, Ecommerce..."
            className={inputBase}
          />
          <p className="text-xs text-slate-500">Separadas por comas.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Intereses requeridos</label>
          <input
            {...register("required_interests")}
            placeholder="AI, Automatizacion..."
            className={inputBase}
          />
          <p className="text-xs text-slate-500">Separados por comas.</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Reglas de exclusion</label>
          <input
            {...register("exclusion_rules")}
            placeholder="Freelancers, Agencias pequenas..."
            className={inputBase}
          />
          <p className="text-xs text-slate-500">Separadas por comas.</p>
        </div>

        <div className="flex items-center gap-3 md:col-span-2">
          <input
            type="checkbox"
            id="is_active"
            {...register("is_active")}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
            ICP activo
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => navigate("/icps")}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : initial ? "Actualizar ICP" : "Crear ICP"}
        </button>
      </div>
    </form>
  );
}

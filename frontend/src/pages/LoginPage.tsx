import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

import { useAuth } from "../auth/AuthProvider";
import { cn } from "../lib/cn";

const schema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contrasena requerida"),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  const onSubmit = async (data: FormData) => {
    setSubmitError("");
    try {
      await login(data.username, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No fue posible iniciar sesion.");
    }
  };

  const inputBase =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-700 text-white">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Lead Qualifier</h1>
          <p className="mt-1 text-sm text-slate-500">Panel privado por usuario</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Iniciar sesion</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Usuario</label>
              <input
                autoFocus
                {...register("username")}
                className={cn(inputBase, errors.username && "border-red-300")}
              />
              {errors.username && (
                <p className="text-xs text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Contrasena</label>
              <input
                type="password"
                {...register("password")}
                className={cn(inputBase, errors.password && "border-red-300")}
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {isSubmitting ? "Ingresando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Acceso autenticado con aislamiento de datos por cuenta
        </p>
      </div>
    </div>
  );
}

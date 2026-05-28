import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Cargando..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      <p className="mt-3 text-sm text-slate-600">{message}</p>
    </div>
  );
}

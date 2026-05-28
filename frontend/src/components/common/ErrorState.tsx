import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Ocurrió un error al cargar los datos.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-12 text-center">
      <div className="rounded-full bg-red-100 p-3">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-red-900">Error</h3>
      <p className="mt-1 max-w-xs text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

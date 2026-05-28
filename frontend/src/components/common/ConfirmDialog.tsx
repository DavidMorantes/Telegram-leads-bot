import { useRef, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div
            className={
              variant === "danger"
                ? "rounded-full bg-red-100 p-2"
                : "rounded-full bg-amber-100 p-2"
            }
          >
            <AlertTriangle
              className={
                variant === "danger" ? "h-5 w-5 text-red-600" : "h-5 w-5 text-amber-600"
              }
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <button
                onClick={onCancel}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={
              variant === "danger"
                ? "rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                : "rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

import { cn } from "../../lib/cn";
import type { Decision } from "../../types/common";

interface LeadDecisionBadgeProps {
  decision: Decision;
}

const styles: Record<Decision, string> = {
  qualified:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  not_qualified:
    "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  uncertain:
    "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  failed:
    "bg-slate-100 text-slate-600 ring-1 ring-slate-500/20",
};

const labels: Record<Decision, string> = {
  qualified: "Cualificado",
  not_qualified: "No cualificado",
  uncertain: "Incierto",
  failed: "Fallido",
};

export function LeadDecisionBadge({ decision }: LeadDecisionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[decision],
      )}
    >
      {labels[decision]}
    </span>
  );
}

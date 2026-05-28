import { StatusBadge } from "../common/StatusBadge";

interface BotStatusBadgeProps {
  isActive: boolean;
}

export function BotStatusBadge({ isActive }: BotStatusBadgeProps) {
  return <StatusBadge active={isActive} activeLabel="Activo" inactiveLabel="Inactivo" />;
}

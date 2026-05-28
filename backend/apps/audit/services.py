class AuditService:
    """Placeholder service for centralized audit event registration."""

    def record(self, *, actor=None, action="", entity_type="", entity_id="", before=None, after=None, ip_address=None):
        """TODO: persist audit events from domain services and admin actions."""
        return {
            "actor_id": getattr(actor, "id", None),
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "before": before or {},
            "after": after or {},
            "ip_address": ip_address,
        }

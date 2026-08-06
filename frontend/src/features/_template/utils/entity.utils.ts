import type { Entity } from "../types/entity.types";
import { ENTITY_STATUS_LABELS } from "../constants/entity.constants";

/** Pure helpers — no React, no fetch. */

export function formatEntityStatus(status: Entity["status"]): string {
  return ENTITY_STATUS_LABELS[status];
}

export function isEntityActive(entity: Entity): boolean {
  return entity.status === "active";
}

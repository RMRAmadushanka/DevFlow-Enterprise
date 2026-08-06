import * as React from "react";

import { DataCard } from "@/components/data-display/cards";
import { formatEntityStatus } from "../utils/entity.utils";
import type { Entity } from "../types/entity.types";

export interface EntityCardProps {
  entity: Entity;
  onClick?: () => void;
}

/**
 * Feature UI component example — domain-specific, not a design-system primitive.
 * Real features replace Entity with their domain model.
 */
function EntityCard({ entity, onClick }: EntityCardProps) {
  return (
    <DataCard
      variant={onClick ? "interactive" : "default"}
      title={entity.name}
      description={formatEntityStatus(entity.status)}
      onClick={onClick}
    />
  );
}

export { EntityCard };

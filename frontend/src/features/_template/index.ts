/**
 * Feature public surface — pages import from here, never deep-import internals
 * unless composing tightly coupled pieces.
 *
 * Copy `_template` → `features/<domain>/` and rename Entity → domain nouns.
 */

export { EntityCard } from "./components/entity-card";
export type { EntityCardProps } from "./components/entity-card";

export {
  entityKeys,
  useGetEntities,
  useGetEntity,
  useCreateEntity,
  useUpdateEntity,
  useDeleteEntity,
} from "./hooks/use-entities";

export { entityService } from "./services/entity.service";
export { useEntityUiStore } from "./store/entity-ui.store";
export { entityFormSchema } from "./schemas/entity.schema";
export type { EntityFormValues } from "./schemas/entity.schema";
export { ENTITY_MODALS, ENTITY_PAGE_SIZE, ENTITY_STATUS_LABELS } from "./constants/entity.constants";
export { formatEntityStatus, isEntityActive } from "./utils/entity.utils";
export type {
  Entity,
  EntityListParams,
  CreateEntityInput,
  UpdateEntityInput,
} from "./types/entity.types";

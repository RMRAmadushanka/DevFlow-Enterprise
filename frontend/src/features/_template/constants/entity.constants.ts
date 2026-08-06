/** Feature-local constants — query defaults, labels, modal ids. */

export const ENTITY_PAGE_SIZE = 20;

export const ENTITY_STATUS_LABELS = {
  active: "Active",
  archived: "Archived",
} as const;

export const ENTITY_MODALS = {
  create: "entity:create",
  edit: "entity:edit",
  delete: "entity:delete",
} as const;

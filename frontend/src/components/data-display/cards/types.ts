import type * as React from "react";

export type DataCardVariant = "default" | "compact" | "interactive" | "selectable";

export interface DataCardProps {
  /** @default "default" */
  variant?: DataCardVariant;
  /** Leading visual — an icon, `UserAvatar`, or `UserAvatarGroup`. */
  icon?: React.ReactNode;
  /** A full-width image/thumbnail rendered above the header. */
  media?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Rendered in the header's top-right corner — typically a `StatusBadge`. */
  badge?: React.ReactNode;
  /** Extra body content below the description (metadata rows, progress, avatars…). */
  children?: React.ReactNode;
  /** Rendered in a bordered footer strip (actions, timestamps…). */
  footer?: React.ReactNode;
  /** `variant="selectable"` only — whether this card is checked. */
  selected?: boolean;
  /** `variant="selectable"` only — fires when the card or its checkbox is toggled. */
  onSelectedChange?: (selected: boolean) => void;
  /** `variant="interactive"` only — makes the whole card a button. */
  onClick?: () => void;
  disabled?: boolean;
  /** Shows a skeleton placeholder instead of the real content. */
  loading?: boolean;
  className?: string;
}

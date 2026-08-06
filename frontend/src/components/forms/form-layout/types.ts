import type { VariantProps } from "class-variance-authority";

import type { formContainerVariants } from "./form-container";
import type { formGridVariants } from "./form-grid";
import type { formActionsVariants } from "./form-actions";

export type FormContainerSize = NonNullable<VariantProps<typeof formContainerVariants>["size"]>;
export type FormContainerSpacing = NonNullable<
  VariantProps<typeof formContainerVariants>["spacing"]
>;
export type FormGridColumns = NonNullable<VariantProps<typeof formGridVariants>["columns"]>;
export type FormActionsAlign = NonNullable<VariantProps<typeof formActionsVariants>["align"]>;

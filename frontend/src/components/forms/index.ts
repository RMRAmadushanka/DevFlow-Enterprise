/**
 * DevFlow Enterprise Form System — public entry point.
 *
 * Barrels every folder in `components/forms/*` so consumers can either:
 *   import { TextInput, SelectField, AppForm } from "@/components/forms";
 * or reach into a single field's folder directly for a smaller import:
 *   import { TextInput } from "@/components/forms/input";
 *
 * See `docs/components/forms.md` for the full guide (foundation, layout,
 * every field, validation, and testing patterns).
 */

// Foundation
export * from "./form-provider";
export * from "./form-layout";
export * from "./form-actions";
export * from "./validation";
export * from "./shared";

// Text & numeric input
export * from "./input";
export * from "./textarea";
export * from "./password";
export * from "./number-input";
export * from "./currency-input";
export * from "./search-input";

// Choice & selection
export * from "./select";
export * from "./multiselect";
export * from "./combobox";
export * from "./autocomplete";
export * from "./checkbox";
export * from "./radio";
export * from "./switch";
export * from "./country-select";

// Date & time
export * from "./date-picker";
export * from "./date-range";
export * from "./time-picker";

// Uploads
export * from "./file-upload";
export * from "./image-upload";

// Specialized entry
export * from "./otp";
export * from "./phone-input";
export * from "./slider";
export * from "./tags-input";

// Rich content
export * from "./color-picker";
export * from "./icon-picker";
export * from "./rich-text";
export * from "./markdown-editor";

# DevFlow Enterprise — Form System

A reusable, type-safe, accessible form component system for DevFlow
Enterprise. It's designed to back **100+ forms and 300+ fields** across the
product from a single, consistent foundation.

**Scope.** Like the [layout system](./layout.md) it sits alongside, this is
a component layer only: no page components, no API calls, no mock business
data. Every field is prop-driven — pages compose these primitives with
their own Zod schemas, default values, and submit handlers. The only
"data" shipped here is genuinely static reference data with no backend
equivalent (ISO country list, a curated Lucide icon catalog) — see
[Reference data](#reference-data).

## Contents

1. [Composition overview](#composition-overview)
2. [Folder structure](#folder-structure)
3. [Foundation: AppForm & useAppForm](#foundation-appform--usaappform)
4. [Form layout](#form-layout)
5. [Validation](#validation)
6. [Form actions](#form-actions)
7. [Field reference](#field-reference)
   - [Text & numeric](#text--numeric-fields)
   - [Choice & selection](#choice--selection-fields)
   - [Date & time](#date--time-fields)
   - [Uploads](#upload-fields)
   - [Specialized entry](#specialized-entry-fields)
   - [Rich content](#rich-content-fields)
8. [Shared patterns](#shared-patterns)
9. [Accessibility](#accessibility)
10. [Responsive behavior](#responsive-behavior)
11. [Motion](#motion)
12. [Reference data](#reference-data)
13. [Testing](#testing)
14. [Best practices](#best-practices)

## Composition overview

Every form is `AppForm` (Zod + React Hook Form) wrapping `form-layout`
structure wrapping fields:

```tsx
"use client";

import { z } from "zod";
import { AppForm, useAppForm } from "@/components/forms/form-provider";
import {
  FormContainer,
  FormSection,
  FormRow,
  FormFooter,
} from "@/components/forms/form-layout";
import { TextInput } from "@/components/forms/input";
import { SelectField } from "@/components/forms/select";
import { FormActionBar } from "@/components/forms/form-actions";
import { requiredString, emailSchema } from "@/components/forms/validation";
import { FormController } from "@/components/forms/form-provider";

const schema = z.object({
  name: requiredString("Name is required"),
  email: emailSchema(),
  role: z.enum(["admin", "member", "viewer"]),
});

export function InviteMemberForm({ onSubmit }: { onSubmit: (v: z.infer<typeof schema>) => Promise<void> }) {
  const form = useAppForm({
    schema,
    defaultValues: { name: "", email: "", role: "member" },
    onSubmit,
    formId: "invite-member",
  });

  return (
    <AppForm form={form}>
      <FormContainer>
        <FormSection title="Member details">
          <FormRow>
            <FormController
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput label="Full name" required error={fieldState.error?.message} {...field} />
              )}
            />
            <FormController
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput label="Email" type="email" required error={fieldState.error?.message} {...field} />
              )}
            />
          </FormRow>
          <FormController
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Role"
                required
                error={fieldState.error?.message}
                options={[
                  { value: "admin", label: "Admin" },
                  { value: "member", label: "Member" },
                  { value: "viewer", label: "Viewer" },
                ]}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </FormSection>
        <FormFooter>
          <FormActionBar isSubmitting={form.isSubmitting} submitLabel="Send invite" />
        </FormFooter>
      </FormContainer>
    </AppForm>
  );
}
```

This is the pattern used throughout: **`FormController` bridges React Hook
Form's `control` to any field's `value`/`onValueChange` (or spreads
`field` directly for fields whose `onChange` signature already matches
RHF's, like `TextInput`)**, and `fieldState.error?.message` flows straight
into every field's `error` prop.

## Folder structure

```
src/components/forms/
  form-provider/    AppForm, useAppForm, dirty-state store, RHF re-exports
  form-layout/       Container/Section/Row/Column/Grid/Divider/Group/Field/
                      Label/Description/Hint/RequiredIndicator/ErrorMessage/
                      SuccessMessage/Footer/Actions
  validation/        Zod schemas, standalone validators, async & cross-field
                      validation helpers, error messages
  form-actions/      SubmitButton, CancelButton, ResetButton, FormActionBar
  shared/            Cross-field types, hooks (useControllableState, etc.),
                      FieldShell (internal layout helper), size tokens,
                      countries + icon catalog reference data

  input/             TextInput
  textarea/          TextareaField
  password/          PasswordInput
  number-input/      NumberInput
  currency-input/    CurrencyInputField
  search-input/      SearchInput

  select/            SelectField
  multiselect/       MultiSelectField
  combobox/          ComboboxField
  autocomplete/      AutocompleteField
  checkbox/          CheckboxField, CheckboxGroupField
  radio/             RadioGroupField
  switch/            SwitchField
  country-select/    CountrySelectField

  date-picker/       DatePickerField
  date-range/        DateRangePickerField
  time-picker/       TimePickerField

  file-upload/       FileUploadField
  image-upload/      ImageUploadField

  otp/               OTPInput
  phone-input/       PhoneInput
  slider/            SliderField
  tags-input/        TagsInputField

  color-picker/      ColorPickerField
  icon-picker/       IconPickerField
  rich-text/         RichTextEditor
  markdown-editor/   MarkdownEditor
```

Every folder exports through an `index.ts` barrel, and `src/components/forms/index.ts`
re-exports all of them — import from wherever is convenient:

```tsx
import { TextInput, SelectField, AppForm } from "@/components/forms";
// or, for a smaller import:
import { TextInput } from "@/components/forms/input";
```

## Foundation: AppForm & useAppForm

**`useAppForm`** wraps React Hook Form's `useForm` with:

- **Zod resolver wiring** — the schema is the single source of truth for
  both the form's TypeScript type and its validation.
- **Async submission handling** — wraps your `onSubmit` in a try/catch,
  exposing `isSubmitting` and `submitError` so a failed submit renders
  through `FormErrorMessage`/`FormFooter` instead of an unhandled rejection.
- **Cross-app dirty tracking** — pass `formId` to register the form's
  `isDirty` state with a shared Zustand store (`useFormDirtyStore`), so
  e.g. a navbar can warn about unsaved changes anywhere in the app via
  `useHasUnsavedChanges()`.

```ts
const form = useAppForm({
  schema,                                  // z.ZodType<FieldValues>
  defaultValues: { name: "", email: "" },  // DefaultValues<z.infer<typeof schema>>
  mode: "onBlur",                          // React Hook Form validation mode, default "onBlur"
  onSubmit: async (values) => api.save(values),
  onError: (error) => toast.error("Something went wrong"),
  formId: "settings-profile",              // optional — enables cross-app dirty tracking
});
```

`useAppForm` returns everything `useForm` does, plus `isSubmitting`,
`submitError`, and `handleFormSubmit` (the `onSubmit`-ready handler).

**`AppForm`** renders the `<form>` element itself, wires
`handleFormSubmit`, and puts the form in React Hook Form's context via
`FormProvider` so descendants can use `useAppFormContext()` /
`FormController` without prop-drilling:

```tsx
<AppForm form={form} className="max-w-lg">
  {/* fields */}
</AppForm>
```

`noValidate` is always set — validation UI is Zod + `FormErrorMessage`,
never the browser's native bubble.

Other exports from `form-provider`:

| Export | Purpose |
| --- | --- |
| `FormController`, `useFormController` | Re-exports of RHF's `Controller`/`useController` |
| `useAppFormContext`, `useAppFormWatch`, `useAppFormState` | Re-exports of RHF's `useFormContext`/`useWatch`/`useFormState` |
| `useFormDirtyStore` | The Zustand dirty-state store directly, for advanced cases |
| `useHasUnsavedChanges()` | `true` if *any* registered form is currently dirty |

## Form layout

Structural, unstyled-logic components — plain `<div>`/`<section>`/`<fieldset>`
wrappers with Tailwind spacing, no Base UI dependency except where noted.

| Component | Purpose |
| --- | --- |
| `FormContainer` | Outer width + vertical rhythm. `size`: `sm`\|`md`\|`lg`\|`full`. `spacing`: `sm`\|`md`\|`lg`. |
| `FormSection` | Groups fields under an optional `title`/`description`/`actions`. |
| `FormRow` | Responsive horizontal layout — stacks to one column below `sm`. |
| `FormColumn` | Vertical stack of fields (building block for `FormRow`/`FormGrid`). |
| `FormGrid` | Responsive CSS grid. `columns`: `1`\|`2`\|`3`\|`4`, collapses to 1 on mobile. |
| `FormDivider` | `<hr>` with an optional centered `label`. |
| `FormGroup` | Wraps Base UI `Fieldset.Root`/`Legend` — used for checkbox/radio groups. `legend`, `description`. |
| `FormField` | Wraps Base UI `Field.Root` — the accessibility context (`invalid`, `disabled`) every field builds on. |
| `FormLabel` | Wraps `Field.Label`, with a `required` prop rendering `FormRequiredIndicator`. |
| `FormDescription` | Wraps `Field.Description` — explanatory copy under a label. |
| `FormHint` | Small inline helper text (no Base UI wiring needed). |
| `FormRequiredIndicator` | The `*` — visually an asterisk, announced as "required" to screen readers. |
| `FormErrorMessage` | Wraps `Field.Error`, animated in/out via Framer Motion, `AlertCircle` icon. |
| `FormSuccessMessage` | Plain `role="status"` region (no Base UI success primitive exists) with a `CheckCircle2` icon. |
| `FormFooter` | Bottom action bar; `sticky` prop pins it to the viewport bottom. |
| `FormActions` | Button row layout. `align`: `start`\|`center`\|`end`\|`between`. |

```tsx
<FormContainer size="md">
  <FormSection title="Profile" description="Your public information">
    <FormRow>
      <TextInput label="First name" />
      <TextInput label="Last name" />
    </FormRow>
  </FormSection>
  <FormDivider label="Danger zone" />
  <FormGroup legend="Notification channels" description="Choose where you're notified">
    <CheckboxGroupField options={channels} />
  </FormGroup>
</FormContainer>
```

## Validation

`components/forms/validation` integrates Zod with React Hook Form and adds
patterns Zod alone doesn't give you out of the box:

- **`schemas.ts`** — reusable field-level schemas: `requiredString`,
  `optionalString`, `emailSchema`, `urlSchema`, `phoneSchema`,
  `usernameSchema`, `passwordSchema(options)` (configurable factory),
  `strongPasswordSchema`, `otpSchema`, `percentageSchema`, `hexColorSchema`,
  `dateSchema`, `tagsSchema`, `fileSchema`, `currencyAmountSchema`.
- **`validators.ts`** — standalone functions for live UI feedback outside
  Zod's parse/fail model: `getPasswordStrength`, `isValidEmail`,
  `isValidUrl`, `isValidHexColor`, `isValidE164Phone`, `isValidOtp`.
- **`async-validation.ts`** — `useAsyncValidation` (debounced client-side
  checks, e.g. "is this username taken?") and `createAsyncValidator` for
  wiring the same kind of check into a Zod `.refine()`.
- **`cross-field.ts`** — `superRefine` helpers for multi-field rules:
  `matchesField` (confirm password), `requireWhen` (conditionally
  required), `validDateRange` (start ≤ end), `atLeastOneOf`.
- **`messages.ts`** — `defaultValidationMessages` and `getErrorMessage(fieldError)`
  for consistent copy across every form.

```ts
import { z } from "zod";
import { passwordSchema, matchesField } from "@/components/forms/validation";

const schema = z
  .object({
    password: passwordSchema(),
    confirmPassword: z.string(),
  })
  .superRefine(matchesField("confirmPassword", "password", "Passwords don't match"));
```

Real-time vs. on-submit validation is a `mode` choice on `useAppForm`
(`"onBlur"` by default — validates on blur, then re-validates live once a
field has an error). Custom/async rules live in the schema itself via
`.refine()`/`.superRefine()` — every field renders whatever error message
Zod produces without any extra wiring.

## Form actions

| Component | Purpose |
| --- | --- |
| `SubmitButton` | `type="submit"`, shows a spinner + optional `loadingText` while `loading`. |
| `CancelButton` | `type="button"`, outline variant by default. |
| `ResetButton` | `type="button"`, optional `confirmMessage` gates a native `confirm()` before calling `onReset`. |
| `FormActionBar` | The common Submit/Cancel/Reset row, pre-wired to `isSubmitting`. |

```tsx
<FormActionBar
  isSubmitting={form.isSubmitting}
  submitLabel="Save changes"
  onCancel={() => router.back()}
  onReset={() => form.reset()}
  resetConfirmMessage="Discard all changes?"
/>
```

For anything more bespoke (an extra "Save as draft" button, a different
order), compose `SubmitButton`/`CancelButton`/`ResetButton` directly inside
`FormActions`.

## Field reference

Every field shares a common prop surface (see
[`BaseFieldProps`](#shared-patterns)) — `label`, `required`, `disabled`,
`error`, `helperText`, `successText`, `validationState`, `size`
(`"sm" | "md" | "lg"`), `className`, `id`, `name` — plus its own
`value`/`onChange`-shaped props. Only what's distinctive per field is
listed below.

### Text & numeric fields

#### TextInput — `components/forms/input`

Single-line text (`type`: `text`\|`email`\|`url`\|`tel`\|`search`).

- **Props**: `icon`, `prefix`, `suffix`, `clearButton`, `loading`, `maxLength`, `autoComplete`, `autoFocus`, `inputRef`.
- **States**: default, hover, focus, disabled, error, success, loading, read-only — all via `disabled`/`readOnly`/`loading`/`validationState`.
- **Accessibility**: built on `InputGroup`/`Input`; label `htmlFor`, `aria-invalid`, `aria-describedby` wired through `FieldShell`.

```tsx
<TextInput label="Website" icon={<Globe />} prefix="https://" clearButton placeholder="example.com" />
```

#### TextareaField — `components/forms/textarea`

- **Props**: `rows`, `minLength`, `maxLength`, `showCounter`, `autoResize` (default `true`, via CSS `field-sizing-content`).
- **Best practice**: pass `maxLength` + `showCounter` together so the limit is visible before submit, not just enforced after.

#### PasswordInput — `components/forms/password`

- **Props**: `showStrengthIndicator`, `showGenerateButton`, `showCopyButton`, `warnCapsLock` (default `true`), `minLength`.
- **Behavior**: visibility toggle, live strength meter (`getPasswordStrength`), a caps-lock warning on the input itself, and optional generate/copy actions for admin-created accounts.

```tsx
<PasswordInput label="Password" showStrengthIndicator showGenerateButton required />
```

#### NumberInput — `components/forms/number-input`

Built on Base UI's `NumberField` (native increment/decrement, keyboard
arrow support).

- **Props**: `mode` (`"decimal" | "currency" | "percentage"`), `currencyCode`, `locale`, `min`, `max`, `step`, `decimalPlaces`, `allowNegative`, `showStepper`.
- For a fuller localized money input (currency-symbol prefix, per-locale grouping), use **`CurrencyInputField`** instead.

#### CurrencyInputField — `components/forms/currency-input`

- **Props**: `currencyCode` (default `"USD"`), `locale`, `min`, `max`, `allowNegative`.
- Shows the locale-correct currency symbol as a prefix (via `Intl.NumberFormat`) while the input itself stays a plain grouped decimal — so typing never fights currency formatting.

#### SearchInput — `components/forms/search-input`

- **Props**: `onSearch` (debounced, `debounceMs` default `300`), `loading`, `shortcut` (default `"/"` — focuses the input, GitHub-style), `clearButton` (on by default).

### Choice & selection fields

#### SelectField — `components/forms/select`

Single select. Built on `Popover` + `Command` (not the native-feeling
`ui/select.tsx`) specifically so search comes free.

- **Props**: `options` (flat `SelectOption[]` or grouped `SelectOptionGroup[]`), `clearable`.
- **Options support**: per-option `disabled`, `icon`, `description`; grouped options render as labeled `CommandGroup`s.
- **Keyboard**: full `cmdk` navigation (arrow keys, type-to-filter, `Enter` to select, `Esc` to close).

```tsx
<SelectField
  label="Priority"
  options={[
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High", icon: <Flame className="text-danger" /> },
  ]}
/>
```

#### MultiSelectField — `components/forms/multiselect`

- **Props**: adds `maxSelected` (selection cap) and `showSelectAll` (default `true`).
- Selected values render as removable `Badge` chips in the trigger; each option shows a checkbox state inside the popover.

#### ComboboxField — `components/forms/combobox`

- **Props**: `loadOptions?: (query: string) => Promise<SelectOption[]>` (debounced via `debounceMs`, default `300`) alongside/instead of static `options`.
- Use when the value must be one of a (possibly server-provided) set of options. For freeform text with suggestions, use `AutocompleteField` instead.

#### AutocompleteField — `components/forms/autocomplete`

- **Props**: `fetchSuggestions` (debounced), `onSelectSuggestion`, `minChars` (default `1`), `emptyText`.
- Unlike `ComboboxField`, the typed text *is* the value — suggestions only help fill it in. Built on a manual positioned dropdown (not `Popover`) for full control over open/close timing while typing.
- **Accessibility**: `role="combobox"` on the input, `role="listbox"`/`role="option"` on the dropdown, `aria-expanded`/`aria-activedescendant` kept in sync with arrow-key navigation.

#### CheckboxField / CheckboxGroupField — `components/forms/checkbox`

- `CheckboxField`: single checkbox with adjacent `label`/`description`, supports `indeterminate`.
- `CheckboxGroupField`: multiple checkboxes sharing one `string[]` value, built on Base UI's `CheckboxGroup` — pass `showSelectAll` for a parent checkbox whose indeterminate state Base UI computes for you from `allValues`.

```tsx
<CheckboxGroupField
  label="Notify me about"
  showSelectAll
  options={[
    { value: "mentions", label: "Mentions" },
    { value: "comments", label: "Comments" },
  ]}
/>
```

#### RadioGroupField — `components/forms/radio`

- **Props**: `orientation`: `"horizontal" | "vertical" | "cards"`. `options[].icon`/`description` render in all three; `"cards"` renders each option as a clickable, bordered card (CSS `has-[[data-checked]]` selects the active card — no extra state needed).

#### SwitchField — `components/forms/switch`

- **Props**: `description`, `loading` (replaces the switch with a spinner mid-toggle), `switchPosition` (`"start" | "end"`, default `"end"` — the standard settings-row layout).

#### CountrySelectField — `components/forms/country-select`

- Searchable, alphabetical country list with flag emoji (no image assets — Unicode regional indicators), built from the shared static `countries` reference data.

### Date & time fields

#### DatePickerField — `components/forms/date-picker`

- **Props**: `minDate`, `maxDate`, `disabledDates` (`Date[]` or a predicate), `locale` (a `date-fns` `Locale`), `formatDate`.
- Built on `react-day-picker`'s `Calendar` inside a `Popover` — keyboard navigation and localization are the underlying library's, not reimplemented here.

#### DateRangePickerField — `components/forms/date-range`

- **Props**: same `minDate`/`maxDate`/`disabledDates`/`locale` as above, plus `presets` (default: Today, Yesterday, Last 7 days, This month — `false` to disable). Renders a dual-month calendar.

#### TimePickerField — `components/forms/time-picker`

- **Props**: `hourFormat` (`"12" | "24"`, default `"24"`), `showSeconds`, `minuteStep`.
- Segmented `NumberField`s for hour/minute[/second] (native arrow-key increment/decrement), plus an AM/PM toggle in 12-hour mode.

### Upload fields

#### FileUploadField — `components/forms/file-upload`

- **Props**: `accept`, `multiple`, `maxFiles`, `maxSizeBytes`, `showPreviews`, and `uploadFile?: (file, onProgress, signal) => Promise<void>`.
- **Integration point**: this component owns all UI orchestration — drag & drop, per-file progress, cancel (via `AbortController`), retry — but performs **no network calls of its own**. Without `uploadFile`, files just become "ready" attachments; wire your real upload function through that one prop.
- **States**: idle → uploading (progress bar) → success / error (retry button) / cancelled.

```tsx
<FileUploadField
  label="Attachments"
  accept=".pdf,.png,.jpg"
  maxSizeBytes={10 * 1024 * 1024}
  maxFiles={5}
  uploadFile={(file, onProgress, signal) => uploadToStorage(file, { onProgress, signal })}
/>
```

#### ImageUploadField — `components/forms/image-upload`

- **Props**: `shape` (`"square" | "circle"`), `previewSize`, `onCropRequested`.
- Click/drag to select, hover reveals Replace/Remove (and Crop, if `onCropRequested` is passed). No cropping library is bundled — `onCropRequested` is the integration point for wiring in your own cropper UI and returning the cropped `File`.

### Specialized entry fields

#### OTPInput — `components/forms/otp`

- **Props**: `length` (default `6`), `mask`, `groupAfter` (e.g. `[3]` renders "123 456"), `onComplete`.
- Auto-focus, auto-advance, and paste-to-fill across all slots are handled natively by Base UI's `OTPField` — this wrapper only adds field chrome and visual grouping.

#### PhoneInput — `components/forms/phone-input`

- **Props**: `defaultCountry` (ISO2, default `"US"`), composes to/from a single E.164 `value` string (e.g. `"+14155551234"`).
- A searchable country/dial-code popover sits inside the same `InputGroup` as the national-number input; parsing prefers the longest matching dial code so e.g. `+44` doesn't get mis-split as `+4` + `4...`.

#### SliderField — `components/forms/slider`

- **Props**: `value`/`defaultValue` as a single `number` (single-thumb) or a 2-element array (range), `marks` (`{ value, label? }[]`), `showValue` (default `true`), `formatValue`.
- Built on Base UI's `Slider`, which owns drag/keyboard/thumb-collision behavior; this wrapper only adds field chrome and tick-mark rendering.

#### TagsInputField — `components/forms/tags-input`

- **Props**: `suggestions` (filtered dropdown as you type), `maxTags`, `allowDuplicates`.
- `Enter`/`,` commits the current text as a tag; `Backspace` on an empty input deletes the last tag.

### Rich content fields

#### ColorPickerField — `components/forms/color-picker`

- **Props**: `presetColors`, `showRecentColors` (default `true`, persisted to `localStorage` as a UI preference — not application data).
- A native `<input type="color">` drives the visual picker; Hex/RGB/HSL text fields (toggled via a small segmented control) stay in sync via `color-utils.ts`'s conversion functions.

#### IconPickerField — `components/forms/icon-picker`

- **Props**: `clearable`. Search + category-chip filtering over the curated Lucide catalog in `shared/icon-catalog.ts` (~150 icons, not all ~1500 — extend that file rather than importing Lucide's full export map).

#### RichTextEditor — `components/forms/rich-text`

- **Props**: `minHeight`. Toolbar: Bold, Italic, Underline, bullet/numbered lists, Link, Image (via URL prompt — no upload endpoint assumed), Table, Code block, Undo/Redo.
- Implementation note: a `contentEditable` div driven by `document.execCommand`, isolated in `./commands.ts` — this system's declared stack doesn't include an editor engine (Tiptap/Lexical/ProseMirror); swap one in there if the app later needs more than basic formatting.

#### MarkdownEditor — `components/forms/markdown-editor`

- **Props**: `defaultMode` (`"edit" | "preview" | "split"`), `minHeight`.
- A plain `<textarea>` with a syntax-inserting toolbar (wraps the current selection in `**bold**`, `_italic_`, etc.) and a live preview rendered through the dependency-free `markdownToHtml` (headings, emphasis, links, inline/fenced code, lists, blockquotes, rules — a practical subset, not full CommonMark).

## Shared patterns

**`BaseFieldProps`** (`components/forms/shared/types.ts`) is the prop
surface every field extends:

```ts
interface BaseFieldProps {
  label?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  helperText?: React.ReactNode;
  successText?: React.ReactNode;
  validationState?: "default" | "error" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
  name?: string;
}
```

**Controlled vs. uncontrolled.** Every field supports both patterns via
`useControllableState` — pass `value` + `onChange`/`onValueChange` for RHF
integration, or just `defaultValue` for a field that manages its own state
(e.g. a filter `SearchInput` with no form behind it).

**`FieldShell`** (internal, `components/forms/shared/field-shell.tsx`) is
the single place the label/description/control/status-message layout is
implemented. It's not part of the public folder structure, but every
field in this system is built on it — extend it, not each field
individually, when the shared chrome needs to change.

**Sizing.** `shared/size.ts` maps the shared `size` prop to Tailwind
classes for control height and icon size, kept consistent across
`Input`-based, `NumberField`-based, and custom fields alike.

## Accessibility

- **Labels**: every field's `label` renders through `FormLabel`
  (`htmlFor`-associated) or, for custom controls (`ColorPickerField`,
  pickers), an explicit `<label htmlFor>`.
- **Required fields**: `FormRequiredIndicator` shows a visual `*` marked
  `aria-hidden`, with separate `sr-only` "required" text for screen readers.
- **Error association**: `aria-invalid` + `aria-describedby` are computed
  by `FieldShell` from the field's `id`, pointing at the rendered
  description/error/success/hint element — never guessed at per field.
- **Focus rings**: every interactive control uses the design system's
  `focus-visible:ring-3 focus-visible:ring-ring/50` treatment — visible
  keyboard focus, no focus ring on mouse click.
- **Keyboard navigation**: delegated to the underlying primitive wherever
  one exists (Base UI's `Select`/`Checkbox`/`RadioGroup`/`Slider`/
  `NumberField`/`OTPField`, `react-day-picker`'s `Calendar`, `cmdk`'s
  `Command`) rather than reimplemented — see each field's notes above for
  anything custom (`AutocompleteField`, `IconPickerField`, `TagsInputField`).
- **Screen readers**: status messages (`FormErrorMessage`,
  `FormSuccessMessage`) are `role="status"`/`role="alert"`-equivalent via
  Base UI's `Field.Error`, or an explicit `role="status"` where no Base UI
  primitive exists.
- Target: **WCAG AA** contrast and interaction patterns throughout,
  inherited from the design system's [accessibility guidelines](../design-system/08-accessibility.md).

## Responsive behavior

`FormRow`/`FormGrid` collapse to a single column below the `sm` breakpoint;
every field is full-width by default so it reflows naturally inside
whatever container (`FormColumn`, a dialog, a card) it's placed in. Popover-
based fields (`SelectField`, `MultiSelectField`, `ComboboxField`,
`DatePickerField`, …) size their content to the trigger via
`w-(--anchor-width)` so dropdowns never overflow narrow mobile viewports.

## Motion

Framer Motion is used sparingly, per the design system's
[motion guidelines](../design-system/10-motion-guidelines.md):

- **Validation messages** (`FormErrorMessage`/`FormSuccessMessage`) fade +
  rise in, and reverse on exit via `AnimatePresence`.
- **Dropdowns/popovers** use Base UI's built-in open/close data-state
  transitions (`data-open:animate-in`, `data-closed:animate-out`).
- **Upload progress bars** animate their width; new file rows in
  `FileUploadField` animate height/opacity in and out via `AnimatePresence`.
- **Tag chips** in `TagsInputField` animate in/out on add/remove.

All durations/easings come from `@/design-system/tokens/motion` — never
hardcoded per component — and respect the user's `prefers-reduced-motion`
setting through the design system's global handling.

## Reference data

Two static datasets ship with this system because they're genuinely
reference data (no backend equivalent, never business data):

- **`shared/countries.ts`** — ~190 ISO 3166-1 countries with dial codes,
  used by `CountrySelectField` and `PhoneInput`. Flags render as Unicode
  regional-indicator emoji (`getFlagEmoji`) — no image assets required.
- **`shared/icon-catalog.ts`** — a curated ~150-icon subset of Lucide,
  categorized for `IconPickerField`. Deliberately not all ~1500 Lucide
  icons, to keep the picker fast and the bundle small; extend this file
  with more entries as real usage demands them.

## Testing

Unit tests live next to each component (`*.test.tsx`), using **Vitest** +
**React Testing Library** (the same stack as the rest of the codebase —
see `vitest.setup.ts` for the shared `jest-axe`/`matchMedia`/`ResizeObserver`
polyfills), covering:

- **Input** — typed value propagation, `clearButton`, icon/prefix/suffix rendering, disabled/error states, no `jest-axe` violations.
- **Select** — opening the popover, filtering options, selecting via keyboard and mouse, `clearable`.
- **Checkbox** — checked/unchecked/indeterminate states, group "select all" behavior.
- **Radio** — single-selection semantics, `cards` orientation click targets.
- **Switch** — toggling, `loading` state disabling interaction.
- **Password** — visibility toggle, strength meter updates as text changes.
- **Date Picker** — selecting a date closes the popover and calls `onValueChange`, `disabledDates` blocks selection.
- **File Upload** — drag/drop and click-to-browse both add files, `maxSizeBytes`/`accept` rejection surfaces `error`, cancel aborts an in-flight upload.
- **OTP** — typing advances focus across slots, paste fills all slots, `onComplete` fires once full.
- **Validation** — schema factories (`passwordSchema`, `emailSchema`, …) and cross-field helpers (`matchesField`, `requireWhen`) against both valid and invalid input.

Run the whole suite with:

```bash
npm run test
```

## Best practices

- **Compose, don't fork.** Reach for `FormRow`/`FormGrid`/`FormSection`
  before writing bespoke layout `<div>`s — 100+ forms staying visually
  consistent depends on it.
- **Always pass `error` from `fieldState.error?.message`**, never a
  hand-rolled validation string — Zod is the single source of truth.
- **Use `formId` on every form that lives inside a multi-step flow or a
  dialog**, so `useHasUnsavedChanges()` can warn before navigation/close.
- **Prefer the schema for validation logic, not the field.** Cross-field
  and async rules belong in `.superRefine()`/`.refine()`, not component
  `onChange` handlers — it keeps validation testable independent of any
  particular field's UI.
- **Don't reach into `shared/field-shell.tsx` from outside this folder.**
  It's the internal layout engine every field is built on, not a public
  API — compose the field components instead.
- **Extend, don't duplicate.** Need a field this system doesn't have?
  Give it its own folder following the same shape (`types.ts`,
  `*-field.tsx`, `index.ts`) and build it on `FieldShell` + the existing
  `shared/` utilities, exactly like every field above.

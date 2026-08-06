/**
 * Thin, intention-revealing re-exports of React Hook Form's context APIs
 * for use inside `AppForm`. Field components in this system are plain
 * controlled components (`value`/`onChange`) so they work standalone —
 * bind them to a form with `FormController`'s render prop:
 *
 * @example
 * <FormController
 *   name="role"
 *   render={({ field, fieldState }) => (
 *     <SelectField
 *       label="Role"
 *       options={roleOptions}
 *       value={field.value}
 *       onValueChange={field.onChange}
 *       error={fieldState.error?.message}
 *     />
 *   )}
 * />
 */
export {
  Controller as FormController,
  useController as useFormController,
  useFormContext as useAppFormContext,
  useWatch as useAppFormWatch,
  useFormState as useAppFormState,
} from "react-hook-form";
export type {
  ControllerRenderProps,
  ControllerFieldState,
  FieldValues,
  Path as FormPath,
} from "react-hook-form";

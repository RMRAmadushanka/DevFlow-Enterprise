"use client";

import * as React from "react";

import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { TextareaField } from "@/components/forms/textarea";
import { SelectField } from "@/components/forms/select";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { TIMEZONE_OPTIONS } from "../constants/auth.constants";
import { useUpdateProfile } from "../hooks/use-account";
import { profileSchema, type ProfileFormValues } from "../schemas/auth.schema";
import type { AuthUserProfile } from "../types/auth.types";
import { toAuthErrorMessage } from "../utils/errors";
import { AvatarUpload } from "./avatar-upload";

export interface ProfileFormProps {
  user: AuthUserProfile;
}

function ProfileForm({ user }: ProfileFormProps) {
  const mutation = useUpdateProfile();

  const form = useAppForm({
    schema: profileSchema,
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      timezone: user.timezone,
      bio: user.bio ?? "",
      avatarUrl: user.avatarUrl ?? null,
    } satisfies ProfileFormValues,
    onSubmit: async (values) => {
      await mutation.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        timezone: values.timezone,
        bio: values.bio,
        avatarUrl: values.avatarUrl,
      });
    },
  });

  React.useEffect(() => {
    form.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      timezone: user.timezone,
      bio: user.bio ?? "",
      avatarUrl: user.avatarUrl ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.firstName, user.lastName, user.phone, user.timezone, user.bio, user.avatarUrl]);

  return (
    <div className="flex flex-col gap-4">
      {form.submitError ? (
        <AlertBanner
          tone="error"
          title="Could not save profile"
          description={toAuthErrorMessage(form.submitError)}
        />
      ) : null}

      <AppForm form={form} className="gap-4">
        <FormController
          name="avatarUrl"
          control={form.control}
          render={({ field, fieldState }) => (
            <AvatarUpload
              value={typeof field.value === "string" ? field.value : null}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput {...field} label="First name" required error={fieldState.error?.message} />
            )}
          />
          <FormController
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput {...field} label="Last name" required error={fieldState.error?.message} />
            )}
          />
        </div>

        <FormController
          name="email"
          control={form.control}
          render={({ field }) => (
            <TextInput {...field} type="email" label="Email" disabled helperText="Contact support to change your email." />
          )}
        />

        <FormController
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput {...field} type="tel" label="Phone" error={fieldState.error?.message} />
          )}
        />

        <FormController
          name="timezone"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Timezone"
              required
              options={[...TIMEZONE_OPTIONS]}
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <FormController
          name="bio"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextareaField
              {...field}
              label="Bio"
              rows={3}
              maxLength={280}
              error={fieldState.error?.message}
            />
          )}
        />

        <SubmitButton loading={form.isSubmitting || mutation.isPending} loadingText="Saving…">
          Save profile
        </SubmitButton>
      </AppForm>
    </div>
  );
}

export { ProfileForm };

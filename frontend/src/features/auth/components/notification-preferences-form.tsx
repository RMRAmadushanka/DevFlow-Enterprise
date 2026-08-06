"use client";

import * as React from "react";

import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { SwitchField } from "@/components/forms/switch";
import { SubmitButton } from "@/components/forms/form-actions";
import { FeatureEmptyState } from "@/components/architecture/empty";

import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../hooks/use-account";
import {
  notificationPreferencesSchema,
  type NotificationPreferencesFormValues,
} from "../schemas/auth.schema";
import { SettingsSkeleton } from "./skeletons";

function NotificationPreferencesForm() {
  const { data, isLoading } = useNotificationPreferences();
  const mutation = useUpdateNotificationPreferences();

  const form = useAppForm({
    schema: notificationPreferencesSchema,
    defaultValues: {
      emailProduct: true,
      emailSecurity: true,
      emailMarketing: false,
      inAppMentions: true,
      inAppDeployments: true,
    } satisfies NotificationPreferencesFormValues,
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });

  React.useEffect(() => {
    if (data) form.reset(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (isLoading) return <SettingsSkeleton />;
  if (!data) {
    return (
      <FeatureEmptyState
        variant="no-data"
        title="No notifications"
        description="Notification preferences will appear when available."
      />
    );
  }

  return (
    <AppForm form={form} className="gap-4">
      {(
        [
          ["emailProduct", "Product updates"],
          ["emailSecurity", "Security alerts"],
          ["emailMarketing", "Marketing emails"],
          ["inAppMentions", "In-app mentions"],
          ["inAppDeployments", "Deployment events"],
        ] as const
      ).map(([name, label]) => (
        <FormController
          key={name}
          name={name}
          control={form.control}
          render={({ field }) => (
            <SwitchField
              label={label}
              checked={Boolean(field.value)}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
          )}
        />
      ))}
      <SubmitButton loading={form.isSubmitting || mutation.isPending}>Save notifications</SubmitButton>
    </AppForm>
  );
}

export { NotificationPreferencesForm };

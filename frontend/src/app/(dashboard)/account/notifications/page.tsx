"use client";

import { AccountSettingsShell, NotificationPreferencesForm } from "@/features/auth";

export default function AccountNotificationsPage() {
  return (
    <AccountSettingsShell
      title="Notifications"
      description="Choose what we email you and what appears in-app"
    >
      <NotificationPreferencesForm />
    </AccountSettingsShell>
  );
}

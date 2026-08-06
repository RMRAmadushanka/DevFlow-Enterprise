"use client";

import {
  AccountSettingsShell,
  PreferenceForm,
  ProfileSkeleton,
  useAuthUser,
} from "@/features/auth";

export default function AccountSettingsPage() {
  const user = useAuthUser();

  if (!user) return <ProfileSkeleton />;

  return (
    <AccountSettingsShell
      title="Preferences"
      description="Theme, language, timezone, and date format"
    >
      <PreferenceForm user={user} />
    </AccountSettingsShell>
  );
}

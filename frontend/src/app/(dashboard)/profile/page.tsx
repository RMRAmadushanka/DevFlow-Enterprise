"use client";

import {
  AccountSettingsShell,
  ProfileCard,
  ProfileForm,
  ProfileSkeleton,
  useAuthUser,
} from "@/features/auth";

export default function ProfilePage() {
  const user = useAuthUser();

  if (!user) return <ProfileSkeleton />;

  return (
    <AccountSettingsShell title="Profile" description="Manage how you appear across DevFlow">
      <div className="flex flex-col gap-6">
        <ProfileCard user={user} />
        <ProfileForm user={user} />
      </div>
    </AccountSettingsShell>
  );
}

"use client";

import { Text } from "@/components/ui/typography";
import {
  AccountSettingsShell,
  ApiKeyTable,
  ChangePasswordForm,
  LoginHistoryTable,
  SessionTable,
  TwoFactorCard,
} from "@/features/auth";

export default function AccountSecurityPage() {
  return (
    <AccountSettingsShell
      title="Security"
      description="Password, sessions, two-factor authentication, and API keys"
    >
      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-3">
          <Text variant="subtitle" as="h3">
            Change password
          </Text>
          <ChangePasswordForm />
        </section>

        <TwoFactorCard />

        <section className="flex flex-col gap-3">
          <Text variant="subtitle" as="h3">
            Active sessions
          </Text>
          <SessionTable />
        </section>

        <section className="flex flex-col gap-3">
          <Text variant="subtitle" as="h3">
            Login history
          </Text>
          <LoginHistoryTable />
        </section>

        <section className="flex flex-col gap-3">
          <Text variant="subtitle" as="h3">
            API keys
          </Text>
          <ApiKeyTable />
        </section>
      </div>
    </AccountSettingsShell>
  );
}

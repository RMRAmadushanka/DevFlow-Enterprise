"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MailWarning, TimerReset } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { TextInput } from "@/components/forms/input";
import { AlertBanner } from "@/components/feedback/alert";
import { routes } from "@/config/routes";
import { isKeycloakEnabled } from "@/lib/auth/keycloak";

import { useEmailVerification } from "../hooks/use-email-verification";

export interface EmailVerificationProps {
  token?: string | null;
  email?: string | null;
}

function EmailVerification({ token, email }: EmailVerificationProps) {
  const oidcEnabled = isKeycloakEnabled();
  const [resendEmail, setResendEmail] = React.useState(email ?? "");
  const { status, resend, resendPending } = useEmailVerification(
    oidcEnabled ? null : token,
    oidcEnabled ? null : email
  );

  if (oidcEnabled) {
    return (
      <div className="flex flex-col items-center gap-4 text-center" role="status">
        <MailWarning className="size-10 text-primary" aria-hidden="true" />
        <div className="space-y-1">
          <Text variant="title" as="h2">
            Verify your email
          </Text>
          <Text tone="secondary">
            Email verification is handled by Keycloak. Use the link in your inbox, then sign in.
          </Text>
        </div>
        <AlertBanner
          tone="info"
          title="Identity provider"
          description="DevFlow does not run a separate email verification system."
        />
        <Button render={<Link href={routes.auth.login} />}>Back to sign in</Button>
      </div>
    );
  }

  if (!token && email) {
    return (
      <div className="flex flex-col items-center gap-4 text-center" role="status">
        <MailWarning className="size-10 text-primary" aria-hidden="true" />
        <div className="space-y-1">
          <Text variant="title" as="h2">
            Check your email
          </Text>
          <Text tone="secondary">
            We sent a verification link to <strong className="text-foreground">{email}</strong>.
          </Text>
        </div>
        <div className="flex w-full flex-col gap-2">
          <TextInput
            label="Email"
            type="email"
            value={resendEmail}
            onChange={setResendEmail}
          />
          <Button
            type="button"
            variant="outline"
            disabled={resendPending || !resendEmail}
            onClick={() => void resend(resendEmail)}
          >
            {resendPending ? "Sending…" : "Resend email"}
          </Button>
        </div>
        <Link href={routes.auth.login} className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  if (status === "checking") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center" role="status" aria-live="polite">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <Text>Verifying your email…</Text>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
        <div className="space-y-1">
          <Text variant="title" as="h2">
            Email verified
          </Text>
          <Text tone="secondary">Your account is ready. Continue to your workspace.</Text>
        </div>
        <Button render={<Link href={routes.app.dashboard} />}>Go to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <TimerReset className="size-10 text-warning" aria-hidden="true" />
      <div className="space-y-1">
        <Text variant="title" as="h2">
          {status === "expired" ? "Link expired" : "Invalid verification link"}
        </Text>
        <Text tone="secondary">Request a new verification email to continue.</Text>
      </div>
      <div className="flex w-full flex-col gap-2">
        <TextInput label="Email" type="email" value={resendEmail} onChange={setResendEmail} />
        <Button
          type="button"
          disabled={resendPending || !resendEmail}
          onClick={() => void resend(resendEmail)}
        >
          {resendPending ? "Sending…" : "Resend email"}
        </Button>
      </div>
    </div>
  );
}

export { EmailVerification };

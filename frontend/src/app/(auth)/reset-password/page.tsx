"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";

import { AuthLayout, ResetPasswordForm } from "@/features/auth";
import { AlertBanner } from "@/components/feedback/alert";
import { routes } from "@/config/routes";

function ResetPasswordContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  return (
    <AuthLayout
      title="Choose a new password"
      description="Use a strong password you haven't used elsewhere"
      footer={
        <Link href={routes.auth.login} className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <AlertBanner
          tone="error"
          title="Missing reset token"
          description="Open the link from your email, or request a new reset."
        />
      )}
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={null}>
      <ResetPasswordContent />
    </React.Suspense>
  );
}

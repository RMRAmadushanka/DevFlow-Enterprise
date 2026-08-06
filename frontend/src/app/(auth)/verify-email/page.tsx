"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { AuthLayout, EmailVerification } from "@/features/auth";

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");

  return (
    <AuthLayout title="Email verification" description="Confirm your email address to activate your account">
      <EmailVerification token={token} email={email} />
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyEmailContent />
    </React.Suspense>
  );
}

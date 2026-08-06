"use client";

import Link from "next/link";

import { AuthLayout, ForgotPasswordForm } from "@/features/auth";
import { routes } from "@/config/routes";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot password"
      description="We'll email you a link to reset it"
      footer={
        <Link href={routes.auth.login} className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

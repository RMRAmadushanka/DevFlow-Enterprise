"use client";

import Link from "next/link";

import { AuthLayout, RegisterForm } from "@/features/auth";
import { routes } from "@/config/routes";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Start collaborating with your engineering team"
      footer={
        <>
          Already have an account?{" "}
          <Link href={routes.auth.login} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}

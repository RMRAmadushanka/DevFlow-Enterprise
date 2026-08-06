"use client";

import Link from "next/link";

import { AuthLayout, LoginForm } from "@/features/auth";
import { routes } from "@/config/routes";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to DevFlow Enterprise"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href={routes.auth.register} className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}

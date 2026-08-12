"use client";

import * as React from "react";
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
      <React.Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <LoginForm />
      </React.Suspense>
    </AuthLayout>
  );
}

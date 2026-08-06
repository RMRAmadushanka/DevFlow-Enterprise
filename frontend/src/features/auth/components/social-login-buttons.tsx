"use client";

import * as React from "react";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SocialProvider } from "../types/auth.types";

export interface SocialLoginButtonsProps {
  onProviderSelect: (provider: SocialProvider) => void | Promise<void>;
  disabled?: boolean;
}

function SocialLoginButtons({ onProviderSelect, disabled }: SocialLoginButtonsProps) {
  const [pending, setPending] = React.useState<SocialProvider | null>(null);

  async function handle(provider: SocialProvider) {
    setPending(provider);
    try {
      await onProviderSelect(provider);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-2" aria-label="Social sign-in">
      <Button
        type="button"
        variant="outline"
        disabled={disabled || pending !== null}
        onClick={() => void handle("github")}
      >
        <span aria-hidden="true" className="font-semibold">
          GH
        </span>
        {pending === "github" ? "Connecting…" : "Continue with GitHub"}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={disabled || pending !== null}
        onClick={() => void handle("google")}
      >
        <Mail aria-hidden="true" />
        {pending === "google" ? "Connecting…" : "Continue with Google"}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={disabled || pending !== null}
        onClick={() => void handle("microsoft")}
      >
        {pending === "microsoft" ? "Connecting…" : "Continue with Microsoft"}
      </Button>
    </div>
  );
}

export { SocialLoginButtons };

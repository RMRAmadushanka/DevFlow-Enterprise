"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SwitchField } from "@/components/forms/switch";
import { PermissionGuard } from "@/lib/permissions";

import { useTwoFactor } from "../hooks/use-account";
import { useAuthUser } from "../hooks/use-session";

function TwoFactorCard() {
  const user = useAuthUser();
  const mutation = useTwoFactor();
  const enabled = Boolean(user?.twoFactorEnabled);

  return (
    <Card data-slot="two-factor-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Two-factor authentication
        </CardTitle>
        <CardDescription>
          Add a second step when signing in. This UI is frontend-only until an authenticator provider is wired.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PermissionGuard permission="settings.update" fallback={<p className="text-sm text-muted-foreground">You can view this setting but not change it.</p>}>
          <SwitchField
            label={enabled ? "2FA is enabled" : "2FA is disabled"}
            checked={enabled}
            disabled={mutation.isPending}
            onCheckedChange={(checked) => void mutation.mutateAsync(Boolean(checked))}
          />
        </PermissionGuard>
        <Button type="button" variant="outline" size="sm" disabled>
          Configure authenticator
        </Button>
      </CardContent>
    </Card>
  );
}

export { TwoFactorCard };

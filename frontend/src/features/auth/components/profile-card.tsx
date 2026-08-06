"use client";

import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
import { UserAvatar } from "@/components/data-display/avatars";
import { StatusBadge } from "@/components/data-display/badges";
import type { AuthUserProfile } from "../types/auth.types";

export interface ProfileCardProps {
  user: AuthUserProfile;
}

function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card data-slot="profile-card">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <UserAvatar
          user={{
            id: user.id,
            name: user.name,
            imageUrl: user.avatarUrl,
          }}
          size="lg"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Text variant="title" as="h2" className="truncate">
              {user.name}
            </Text>
            <StatusBadge tone="info">{user.role}</StatusBadge>
            {user.emailVerified ? (
              <StatusBadge tone="success">Verified</StatusBadge>
            ) : (
              <StatusBadge tone="warning">Unverified</StatusBadge>
            )}
          </div>
          <Text tone="secondary" className="truncate">
            {user.email}
          </Text>
          {user.bio ? (
            <Text tone="muted" className="text-sm">
              {user.bio}
            </Text>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export { ProfileCard };

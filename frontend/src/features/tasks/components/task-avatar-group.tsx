"use client";

import { UserAvatarGroup } from "@/components/data-display/avatars";

import type { TaskUser } from "../types/task.types";

export interface TaskAvatarGroupProps {
  users: TaskUser[];
  max?: number;
  size?: "sm" | "default" | "lg";
  className?: string;
}

function toAvatarUsers(users: TaskUser[]) {
  return users.map((user) => ({ id: user.id, name: user.name, imageUrl: user.avatarUrl }));
}

function TaskAvatarGroup({ users, max, size, className }: TaskAvatarGroupProps) {
  return <UserAvatarGroup users={toAvatarUsers(users)} max={max} size={size} className={className} />;
}

export { TaskAvatarGroup };

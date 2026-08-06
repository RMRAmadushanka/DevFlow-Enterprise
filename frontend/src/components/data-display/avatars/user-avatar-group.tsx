import * as React from "react";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { UserAvatar } from "./user-avatar";
import type { UserAvatarGroupProps } from "./types";

/**
 * A stack of overlapping `UserAvatar`s with a "+N" overflow count — e.g. the
 * assignees on a task or the members of a team. Each visible avatar is
 * wrapped in a tooltip revealing the person's name.
 */
function UserAvatarGroup({ users, max = 4, size = "default", className }: UserAvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;

  return (
    <AvatarGroup data-size={size} className={className}>
      {visible.map((user) => (
        <Tooltip key={user.id ?? user.name}>
          <TooltipTrigger render={<span tabIndex={0} />}>
            <UserAvatar user={user} size={size} />
          </TooltipTrigger>
          <TooltipContent>{user.name}</TooltipContent>
        </Tooltip>
      ))}
      {overflow > 0 ? (
        <AvatarGroupCount aria-label={`${overflow} more ${overflow === 1 ? "person" : "people"}`}>
          +{overflow}
        </AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  );
}

export { UserAvatarGroup };

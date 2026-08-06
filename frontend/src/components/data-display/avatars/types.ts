export type AvatarStatus = "online" | "offline" | "away" | "busy";

export interface AvatarUser {
  /** Stable identifier — used as the React key inside `UserAvatarGroup`. Falls back to `name`. */
  id?: string;
  name: string;
  imageUrl?: string;
}

export interface UserAvatarProps {
  user: AvatarUser;
  /** @default "default" */
  size?: "sm" | "default" | "lg";
  /** Renders a small colored presence dot in the corner. Omit for no indicator. */
  status?: AvatarStatus;
  className?: string;
}

export interface UserAvatarGroupProps {
  users: AvatarUser[];
  /** Maximum avatars shown before collapsing the rest into a "+N" count. @default 4 */
  max?: number;
  /** @default "default" */
  size?: "sm" | "default" | "lg";
  className?: string;
}

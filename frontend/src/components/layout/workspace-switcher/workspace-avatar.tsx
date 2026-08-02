import { cn } from "@/lib/utils";

export interface WorkspaceAvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md";
  className?: string;
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/**
 * Square avatar used for both organizations and projects — square (not
 * round) to visually distinguish workspace identity from user identity
 * (`Avatar`/`UserDropdown`, which are round).
 */
export function WorkspaceAvatar({ name, imageUrl, size = "md", className }: WorkspaceAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary text-xs font-semibold text-secondary-foreground",
        size === "sm" ? "size-5 text-[10px]" : "size-7",
        className
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="size-full object-cover" />
      ) : (
        getInitial(name)
      )}
    </span>
  );
}

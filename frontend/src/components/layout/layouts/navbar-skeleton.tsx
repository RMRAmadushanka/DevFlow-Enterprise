import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder shown in place of `<Navbar>` before workspace/user data is available. */
export function NavbarSkeleton() {
  return (
    <header
      aria-hidden="true"
      className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-3 sm:px-4"
    >
      <Skeleton className="h-6 w-32 sm:w-48" />
      <div className="ml-auto flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-md sm:w-64" />
        <Skeleton className="size-9 rounded-md" />
        <Skeleton className="size-9 rounded-full" />
      </div>
    </header>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { NavbarSkeleton } from "./navbar-skeleton";
import { SidebarSkeleton } from "./sidebar-skeleton";

/**
 * Full-shell loading state — an `AppShell`-shaped skeleton composed of
 * `SidebarSkeleton` + `NavbarSkeleton` + placeholder content blocks.
 * Use as a Suspense fallback (or manual loading branch) while the data
 * needed to render the real shell (org/user/nav) is still resolving.
 */
export function LoadingLayout() {
  return (
    <div className="flex min-h-screen bg-background" role="status" aria-label="Loading application">
      <SidebarSkeleton />
      <div className="flex min-w-0 flex-1 flex-col">
        <NavbarSkeleton />
        <div className="flex flex-col gap-4 p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

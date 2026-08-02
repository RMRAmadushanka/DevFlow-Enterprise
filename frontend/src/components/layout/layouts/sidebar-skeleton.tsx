import { Skeleton } from "@/components/ui/skeleton";
import { SIDEBAR_WIDTH_EXPANDED } from "@/components/layout/sidebar/constants";

/** Placeholder shown in place of `<Sidebar>` before workspace/nav data is available. */
export function SidebarSkeleton() {
  return (
    <aside
      aria-hidden="true"
      style={{ width: SIDEBAR_WIDTH_EXPANDED }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col gap-4 border-r border-sidebar-border bg-sidebar p-3 md:flex"
    >
      <div className="flex items-center gap-2">
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-9 w-full rounded-md" />
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full rounded-md" />
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-1.5">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </aside>
  );
}

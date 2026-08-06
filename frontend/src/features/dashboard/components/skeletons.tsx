"use client";

import {
  DashboardGrid,
  DashboardGridItem,
  DashboardSkeleton,
} from "@/components/dashboard";

function DashboardPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex flex-col gap-2">
        <DashboardSkeleton variant="metric" className="h-8 w-64" />
        <DashboardSkeleton variant="metric" className="h-4 w-80" />
      </div>

      <DashboardGrid columns={12} gap={4}>
        {Array.from({ length: 6 }, (_, index) => (
          <DashboardGridItem key={index} span={1} mdSpan={4} xlSpan={2}>
            <DashboardSkeleton variant="metric" />
          </DashboardGridItem>
        ))}
      </DashboardGrid>

      <DashboardGrid columns={12} gap={4}>
        <DashboardGridItem span={1} mdSpan={7} xlSpan={8}>
          <DashboardSkeleton variant="table" height={280} />
        </DashboardGridItem>
        <DashboardGridItem span={1} mdSpan={5} xlSpan={4}>
          <DashboardSkeleton variant="chart" height={280} />
        </DashboardGridItem>
        <DashboardGridItem span={1} mdSpan={6} xlSpan={6}>
          <DashboardSkeleton variant="chart" height={260} />
        </DashboardGridItem>
        <DashboardGridItem span={1} mdSpan={6} xlSpan={6}>
          <DashboardSkeleton variant="card" height={260} />
        </DashboardGridItem>
      </DashboardGrid>
    </div>
  );
}

export { DashboardPageSkeleton as DashboardSkeleton };

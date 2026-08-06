import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { SkeletonTableProps } from "./types";

/** A placeholder matching `DataTable`'s row/column grid — shown while the first page of data is loading. */
function SkeletonTable({ rows = 5, columns = 4, showHeader = true, className }: SkeletonTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border", className)} aria-hidden="true">
      <Table>
        {showHeader ? (
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {Array.from({ length: columns }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-3.5 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        ) : null}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-transparent">
              {Array.from({ length: columns }).map((_, columnIndex) => (
                <TableCell key={columnIndex}>
                  <Skeleton className="h-3.5" style={{ width: columnIndex === 0 ? "80%" : "60%" }} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { SkeletonTable };

"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { formatSprintRange } from "../utils/dates";
import type { Sprint } from "../types/sprint.types";

export interface SprintCalendarProps {
  sprints: Sprint[];
  className?: string;
}

function getMonthMatrix(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const days: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i += 1) days.push(null);
  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) days.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function dateInRange(date: Date, start: string, end: string): boolean {
  const key = date.toISOString().slice(0, 10);
  return key >= start && key <= end;
}

function SprintCalendar({ sprints, className }: SprintCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = React.useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const matrix = getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth());
  const monthLabel = viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const sprintsInMonth = sprints.filter((sprint) => {
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    return start <= monthEnd && end >= monthStart;
  });

  return (
    <div
      className={cn("rounded-xl border border-border bg-card", className)}
      data-slot="sprint-calendar"
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Previous month"
          onClick={() =>
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
          }
        >
          <ChevronLeft className="size-4" />
        </Button>
        <h2 className="text-sm font-semibold">{monthLabel}</h2>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Next month"
          onClick={() =>
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
          }
        >
          <ChevronRight className="size-4" />
        </Button>
      </header>

      <div className="grid grid-cols-7 gap-px border-b border-border bg-border text-center text-xs font-medium text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-card py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-border">
        {matrix.flat().map((date, index) => {
          const activeSprints = date
            ? sprints.filter((s) => dateInRange(date, s.startDate, s.endDate))
            : [];
          const isToday =
            date &&
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

          return (
            <div
              key={index}
              className={cn(
                "min-h-[72px] bg-card p-1.5",
                !date && "bg-muted/20",
                isToday && "ring-1 ring-inset ring-primary/40"
              )}
            >
              {date ? (
                <>
                  <span className="text-xs tabular-nums text-muted-foreground">{date.getDate()}</span>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {activeSprints.slice(0, 2).map((sprint) => (
                      <span
                        key={sprint.id}
                        className="truncate rounded bg-primary/10 px-1 text-[10px] text-primary"
                        title={sprint.name}
                      >
                        {sprint.name}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      {sprintsInMonth.length > 0 ? (
        <footer className="border-t border-border px-4 py-3">
          <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
            {sprintsInMonth.map((sprint) => (
              <li key={sprint.id}>
                <strong className="text-foreground">{sprint.name}</strong> —{" "}
                {formatSprintRange(sprint.startDate, sprint.endDate)}
              </li>
            ))}
          </ul>
        </footer>
      ) : null}
    </div>
  );
}

export { SprintCalendar };

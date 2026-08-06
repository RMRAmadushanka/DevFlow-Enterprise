"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { Task } from "../types/task.types";
import { isOverdue } from "../utils/format";

export interface TaskCalendarFoundationProps {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
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

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function TaskCalendarFoundation({ tasks, onSelectTask, className }: TaskCalendarFoundationProps) {
  const today = new Date();
  const [viewDate, setViewDate] = React.useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const existing = map.get(task.dueDate) ?? [];
      existing.push(task);
      map.set(task.dueDate, existing);
    }
    return map;
  }, [tasks]);

  const matrix = getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth());
  const monthLabel = viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  function prevMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card", className)} data-slot="task-calendar">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Previous month" onClick={prevMonth}>
          <ChevronLeft className="size-4" />
        </Button>
        <h2 className="text-sm font-semibold">{monthLabel}</h2>
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Next month" onClick={nextMonth}>
          <ChevronRight className="size-4" />
        </Button>
      </header>

      <div className="grid grid-cols-7 border-b border-border text-center text-xs font-medium text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="px-1 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {matrix.flat().map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="min-h-24 border-b border-r border-border bg-muted/20" />;
          }

          const key = dateKey(date);
          const dayTasks = tasksByDate.get(key) ?? [];
          const isToday = dateKey(today) === key;

          return (
            <div
              key={key}
              className={cn(
                "min-h-24 border-b border-r border-border p-1.5",
                isToday && "bg-primary/5"
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                  isToday && "bg-primary text-primary-foreground font-medium"
                )}
              >
                {date.getDate()}
              </span>
              <ul className="mt-1 space-y-0.5">
                {dayTasks.slice(0, 3).map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      className={cn(
                        "w-full truncate rounded px-1 py-0.5 text-left text-[0.625rem] outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
                        isOverdue(task.dueDate, task.status) && "text-destructive"
                      )}
                      onClick={() => onSelectTask?.(task)}
                    >
                      {task.key}
                    </button>
                  </li>
                ))}
                {dayTasks.length > 3 ? (
                  <li className="px-1 text-[0.625rem] text-muted-foreground">
                    +{dayTasks.length - 3} more
                  </li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>

      {tasks.filter((t) => t.dueDate).length === 0 ? (
        <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          No tasks with due dates this month.
        </p>
      ) : null}
    </div>
  );
}

export { TaskCalendarFoundation };

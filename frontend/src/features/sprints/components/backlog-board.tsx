"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useReorderBacklog } from "../hooks/use-sprints";
import { useSprintStore } from "../store/sprint.store";
import type { BacklogItem } from "../types/sprint.types";
import { BacklogTaskCard } from "./backlog-task-card";
import { SprintEmptyState } from "./sprint-empty-state";
import { SprintSearch } from "./sprint-search";
import { PlanningSkeleton } from "./sprint-skeleton";

export interface BacklogBoardProps {
  projectId: string;
  items: BacklogItem[];
  loading?: boolean;
  onMoveToSprint?: (taskIds: string[]) => void;
  className?: string;
}

function groupByEpic(items: BacklogItem[]): Map<string, BacklogItem[]> {
  const groups = new Map<string, BacklogItem[]>();
  for (const item of items) {
    const key = item.epicName ?? "Uncategorized";
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return groups;
}

function BacklogBoard({
  projectId,
  items,
  loading,
  onMoveToSprint,
  className,
}: BacklogBoardProps) {
  const reorder = useReorderBacklog(projectId);
  const selectedIds = useSprintStore((s) => s.selectedBacklogIds);
  const setSelectedBacklogIds = useSprintStore((s) => s.setSelectedBacklogIds);
  const q = useSprintStore((s) => s.filters.q);

  const [orderedItems, setOrderedItems] = React.useState(items);
  const [activeItem, setActiveItem] = React.useState<BacklogItem | null>(null);

  React.useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  const filteredItems = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return orderedItems;
    return orderedItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.key.toLowerCase().includes(query) ||
        item.epicName?.toLowerCase().includes(query)
    );
  }, [orderedItems, q]);

  const epicGroups = React.useMemo(() => groupByEpic(filteredItems), [filteredItems]);
  const totalPoints = filteredItems.reduce((sum, item) => sum + (item.storyPoints ?? 0), 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    const item = orderedItems.find((i) => i.id === String(event.active.id));
    setActiveItem(item ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === String(active.id));
      const newIndex = prev.findIndex((i) => i.id === String(over.id));
      const next = arrayMove(prev, oldIndex, newIndex);
      void reorder.mutateAsync(next.map((i) => i.id));
      return next;
    });
  }

  function toggleSelect(id: string, selected: boolean) {
    if (selected) {
      setSelectedBacklogIds([...selectedIds, id]);
    } else {
      setSelectedBacklogIds(selectedIds.filter((x) => x !== id));
    }
  }

  if (loading) {
    return <PlanningSkeleton />;
  }

  if (items.length === 0) {
    return <SprintEmptyState variant="no-backlog" />;
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} data-slot="backlog-board">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SprintSearch className="max-w-md flex-1" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="tabular-nums">{filteredItems.length} items</span>
          <span>·</span>
          <span className="tabular-nums">{totalPoints} pts</span>
        </div>
      </div>

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <span className="text-sm">{selectedIds.length} selected</span>
          {onMoveToSprint ? (
            <Button type="button" size="sm" onClick={() => onMoveToSprint(selectedIds)}>
              Move to sprint
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setSelectedBacklogIds([])}
          >
            Clear
          </Button>
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-6">
          {Array.from(epicGroups.entries()).map(([epic, epicItems]) => (
            <section key={epic} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">{epic}</h3>
              <SortableContext items={epicItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {epicItems.map((item) => (
                    <BacklogTaskCard
                      key={item.id}
                      item={item}
                      draggable
                      selected={selectedIds.includes(item.id)}
                      onSelect={toggleSelect}
                    />
                  ))}
                </div>
              </SortableContext>
            </section>
          ))}
        </div>
        <DragOverlay>
          {activeItem ? <BacklogTaskCard item={activeItem} draggable /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export { BacklogBoard };

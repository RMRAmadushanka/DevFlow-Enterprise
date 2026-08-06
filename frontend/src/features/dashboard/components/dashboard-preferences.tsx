"use client";

import * as React from "react";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal } from "@/components/feedback/modal";
import { toast } from "@/components/feedback/toast";

import { DASHBOARD_WIDGET_IDS, WIDGET_LABELS } from "../constants/dashboard.constants";
import { useDashboardPreferences } from "../hooks/use-dashboard-preferences";
import type { DashboardWidgetId } from "../types/dashboard.types";

function DashboardPreferencesPanel() {
  const [open, setOpen] = React.useState(false);
  const { preferences, toggleWidget, setWidgetOrder, resetPreferences, isVisible } =
    useDashboardPreferences();

  const move = (id: DashboardWidgetId, direction: -1 | 1) => {
    const order = [...preferences.widgetOrder];
    const index = order.indexOf(id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= order.length) return;
    const current = order[index]!;
    order[index] = order[next]!;
    order[next] = current;
    setWidgetOrder(order);
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-label="Customize dashboard"
        onClick={() => setOpen(true)}
      >
        <Settings2 className="size-4" />
        Customize
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Customize dashboard"
        description="Show or hide widgets and adjust their order. Preferences are saved automatically."
      >
        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
          {DASHBOARD_WIDGET_IDS.map((id) => (
            <div key={id} className="flex items-center justify-between gap-2">
              <label className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                <Checkbox
                  checked={isVisible(id)}
                  onCheckedChange={() => toggleWidget(id)}
                  aria-label={`Toggle ${WIDGET_LABELS[id]}`}
                />
                <span className="truncate">{WIDGET_LABELS[id]}</span>
              </label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Move ${WIDGET_LABELS[id]} up`}
                  onClick={() => move(id, -1)}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Move ${WIDGET_LABELS[id]} down`}
                  onClick={() => move(id, 1)}
                >
                  ↓
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => {
              resetPreferences();
              toast.success("Dashboard layout reset");
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1"
            onClick={() => {
              toast.success("Layout preferences saved");
              setOpen(false);
            }}
          >
            Done
          </Button>
        </div>
      </Modal>
    </>
  );
}

export { DashboardPreferencesPanel as DashboardPreferences };

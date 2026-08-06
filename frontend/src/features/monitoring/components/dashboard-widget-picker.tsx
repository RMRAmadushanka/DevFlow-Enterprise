"use client";

import * as React from "react";

import { WIDGET_LABELS } from "../constants/monitoring.constants";
import { useMonitoringStore } from "../store/monitoring.store";
import type { DashboardWidgetId } from "../types/monitoring.types";
import { CheckboxField } from "@/components/forms/checkbox";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/feedback/modal";

const ALL_WIDGETS = Object.keys(WIDGET_LABELS) as DashboardWidgetId[];

export interface DashboardWidgetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DashboardWidgetPicker({ open, onOpenChange }: DashboardWidgetPickerProps) {
  const selected = useMonitoringStore((s) => s.dashboardWidgets);
  const setDashboardWidgets = useMonitoringStore((s) => s.setDashboardWidgets);
  const toggleWidget = useMonitoringStore((s) => s.toggleWidget);
  const [draft, setDraft] = React.useState<DashboardWidgetId[]>(selected);

  React.useEffect(() => {
    if (open) setDraft(selected);
  }, [open, selected]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Customize dashboard"
      description="Choose which widgets appear on your custom monitoring dashboard."
    >
      <div className="flex flex-col gap-3">
        {ALL_WIDGETS.map((id) => (
          <CheckboxField
            key={id}
            label={WIDGET_LABELS[id]}
            checked={draft.includes(id)}
            onCheckedChange={(checked) => {
              setDraft((prev) =>
                checked ? [...prev, id] : prev.filter((w) => w !== id)
              );
            }}
          />
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              setDashboardWidgets(draft);
              onOpenChange(false);
            }}
          >
            Apply
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              ALL_WIDGETS.forEach((id) => {
                if (!selected.includes(id)) toggleWidget(id);
              });
            }}
            className="sr-only"
            tabIndex={-1}
          >
            Toggle helpers
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export { DashboardWidgetPicker };

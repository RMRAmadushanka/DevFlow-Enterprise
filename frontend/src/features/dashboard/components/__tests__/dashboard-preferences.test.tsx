import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";

import { DashboardPreferences } from "../dashboard-preferences";
import { useDashboardStore } from "../../store/dashboard.store";
import { DEFAULT_DASHBOARD_PREFERENCES } from "../../constants/dashboard.constants";

describe("DashboardPreferences", () => {
  beforeEach(() => {
    useDashboardStore.setState({
      preferences: structuredClone(DEFAULT_DASHBOARD_PREFERENCES),
    });
  });

  it("toggles widget visibility", async () => {
    render(<DashboardPreferences />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /customize dashboard/i }));
    const checkbox = await screen.findByRole("checkbox", { name: /toggle quick actions/i });
    await user.click(checkbox);
    expect(useDashboardStore.getState().preferences.visibleWidgets).not.toContain("quick-actions");
  });
});

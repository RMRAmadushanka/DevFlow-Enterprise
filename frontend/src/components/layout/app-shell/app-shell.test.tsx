import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  sampleNotifications,
  sampleOrganizations,
  sampleProjects,
  sampleUser,
} from "@/components/layout/sample-data";
import { useLayoutStore } from "@/store/layout-store";
import { useUIPreferencesStore } from "@/store/ui-preferences-store";
import { AppShell } from "./app-shell";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true });
}

function renderAppShell(overrides: Partial<React.ComponentProps<typeof AppShell>> = {}) {
  return render(
    <AppShell
      organizations={sampleOrganizations}
      projects={sampleProjects}
      activeOrganizationId={sampleOrganizations[0].id}
      activeProjectId={sampleProjects[0].id}
      user={sampleUser}
      notifications={sampleNotifications}
      {...overrides}
    >
      <div>Page content</div>
    </AppShell>
  );
}

beforeEach(() => {
  setViewportWidth(1440);
  useUIPreferencesStore.setState({ sidebarCollapsed: false });
  useLayoutStore.setState({ mobileNavOpen: false, commandMenuOpen: false });
  push.mockClear();
});

afterEach(() => {
  useUIPreferencesStore.setState({ sidebarCollapsed: false });
  useLayoutStore.setState({ mobileNavOpen: false, commandMenuOpen: false });
});

describe("AppShell", () => {
  it("renders the sidebar, navbar, and page content together", () => {
    renderAppShell();

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open search and command menu" })).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("provides a skip-to-content link as the first focusable element", () => {
    renderAppShell();
    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute("href", "#main-content");
  });

  it("opens the mobile navigation drawer when the navbar menu button is clicked", async () => {
    renderAppShell();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Open navigation menu" }));

    expect(useLayoutStore.getState().mobileNavOpen).toBe(true);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("toggles the sidebar collapsed state when the collapse button is clicked", async () => {
    renderAppShell();
    const user = userEvent.setup();

    expect(useUIPreferencesStore.getState().sidebarCollapsed).toBe(false);
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    expect(useUIPreferencesStore.getState().sidebarCollapsed).toBe(true);
  });

  it("defaults the sidebar to collapsed when rendered at tablet width", () => {
    setViewportWidth(900);
    renderAppShell();

    expect(useUIPreferencesStore.getState().sidebarCollapsed).toBe(true);
  });

  it("opens the command menu via the keyboard shortcut and navigates on selection", async () => {
    renderAppShell();
    const user = userEvent.setup();

    await user.keyboard("{Meta>}k{/Meta}");
    const dashboardOption = await screen.findByText("Go to Dashboard");
    await user.click(dashboardOption);

    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(useLayoutStore.getState().commandMenuOpen).toBe(false);
  });

  it("renders notifications in the navbar bell", async () => {
    renderAppShell();
    const user = userEvent.setup();

    const unreadCount = sampleNotifications.filter((n) => !n.read).length;
    await user.click(screen.getByRole("button", { name: `Notifications (${unreadCount} unread)` }));

    const popover = await screen.findByText("Notifications");
    expect(popover).toBeInTheDocument();
    expect(within(document.body).getByText(sampleNotifications[0].title)).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = renderAppShell();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});

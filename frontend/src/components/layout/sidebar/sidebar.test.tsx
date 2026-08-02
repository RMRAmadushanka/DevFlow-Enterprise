import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { sampleOrganizations, sampleProjects, sampleUser } from "@/components/layout/sample-data";
import { Sidebar } from "./sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects",
}));

function renderSidebar(overrides: Partial<React.ComponentProps<typeof Sidebar>> = {}) {
  return render(
    <Sidebar
      collapsed={false}
      mobileOpen={false}
      onMobileClose={vi.fn()}
      organizations={sampleOrganizations}
      projects={sampleProjects}
      activeOrganizationId={sampleOrganizations[0].id}
      user={sampleUser}
      {...overrides}
    />
  );
}

describe("Sidebar", () => {
  it("renders the primary navigation with labels and hrefs", () => {
    renderSidebar();

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");

    const projectsLinks = screen.getAllByRole("link", { name: "Projects" });
    expect(projectsLinks.length).toBeGreaterThan(0);
  });

  it("marks the item matching the current route as active", () => {
    renderSidebar();

    const activeLinks = screen.getAllByRole("link", { name: "Projects" });
    const currentLink = activeLinks.find((link) => link.getAttribute("aria-current") === "page");
    expect(currentLink).toBeDefined();

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink).not.toHaveAttribute("aria-current");
  });

  it("shows a badge count on items that define one", () => {
    renderSidebar();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("keeps an accessible name for nav items when collapsed to icon-only", () => {
    renderSidebar({ collapsed: true });
    expect(screen.getAllByRole("link", { name: "Dashboard" }).length).toBeGreaterThan(0);
  });

  it("calls onToggleCollapse when the collapse button is clicked", async () => {
    const onToggleCollapse = vi.fn();
    renderSidebar({ onToggleCollapse });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it("renders the workspace switcher with the active organization name", () => {
    renderSidebar();
    expect(screen.getAllByText(sampleOrganizations[0].name).length).toBeGreaterThan(0);
  });

  it("renders the user account menu trigger", () => {
    renderSidebar();
    expect(screen.getAllByRole("button", { name: `Account menu for ${sampleUser.name}` }).length).toBeGreaterThan(0);
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = renderSidebar();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});

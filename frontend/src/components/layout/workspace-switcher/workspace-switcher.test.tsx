import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { sampleOrganizations, sampleProjects } from "@/components/layout/sample-data";
import { WorkspaceSwitcher } from "./workspace-switcher";

function renderSwitcher(overrides: Partial<React.ComponentProps<typeof WorkspaceSwitcher>> = {}) {
  return render(
    <WorkspaceSwitcher
      organizations={sampleOrganizations}
      projects={sampleProjects}
      activeOrganizationId={sampleOrganizations[0].id}
      activeProjectId={sampleProjects[0].id}
      {...overrides}
    />
  );
}

describe("WorkspaceSwitcher", () => {
  it("renders the active organization name in the trigger", () => {
    renderSwitcher();
    expect(
      screen.getByRole("button", { name: `Switch workspace, current: ${sampleOrganizations[0].name}` })
    ).toBeInTheDocument();
  });

  it("lists organizations and the active org's projects when opened", async () => {
    renderSwitcher();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Switch workspace/ }));

    expect(await screen.findByText("Organizations")).toBeInTheDocument();
    for (const org of sampleOrganizations) {
      // The active org's name legitimately appears twice: once in the
      // trigger button, once in the opened list.
      expect(screen.getAllByText(org.name).length).toBeGreaterThan(0);
    }

    expect(screen.getByText("Projects")).toBeInTheDocument();
    const projectsForActiveOrg = sampleProjects.filter((p) => p.organizationId === sampleOrganizations[0].id);
    for (const project of projectsForActiveOrg) {
      expect(screen.getByText(project.name)).toBeInTheDocument();
    }

    const otherOrgProject = sampleProjects.find((p) => p.organizationId !== sampleOrganizations[0].id);
    expect(screen.queryByText(otherOrgProject!.name)).not.toBeInTheDocument();
  });

  it("calls onSelectOrganization when a different organization is clicked", async () => {
    const onSelectOrganization = vi.fn();
    renderSwitcher({ onSelectOrganization });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Switch workspace/ }));
    const secondOrg = sampleOrganizations[1];
    await user.click(await screen.findByText(secondOrg.name));

    expect(onSelectOrganization).toHaveBeenCalledWith(secondOrg.id);
  });

  it("calls onCreateWorkspace when the create-workspace item is clicked", async () => {
    const onCreateWorkspace = vi.fn();
    renderSwitcher({ onCreateWorkspace });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Switch workspace/ }));
    await user.click(await screen.findByText("Create workspace"));

    expect(onCreateWorkspace).toHaveBeenCalledTimes(1);
  });

  it("renders as an icon-only trigger when collapsed", () => {
    renderSwitcher({ collapsed: true });
    const trigger = screen.getByRole("button", { name: /Switch workspace/ });
    expect(trigger).not.toHaveTextContent(sampleOrganizations[0].name);
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = renderSwitcher();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});

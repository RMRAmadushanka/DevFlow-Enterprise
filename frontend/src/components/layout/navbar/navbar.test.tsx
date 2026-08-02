import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { sampleNotifications, sampleUser } from "@/components/layout/sample-data";
import { useLayoutStore } from "@/store/layout-store";
import { Navbar } from "./navbar";

function renderNavbar(overrides: Partial<React.ComponentProps<typeof Navbar>> = {}) {
  return render(
    <Navbar
      onOpenMobileNav={vi.fn()}
      notifications={sampleNotifications}
      user={sampleUser}
      {...overrides}
    />
  );
}

afterEach(() => {
  useLayoutStore.setState({ commandMenuOpen: false, mobileNavOpen: false });
});

describe("Navbar", () => {
  it("renders the search trigger, notification bell, and account menu", () => {
    renderNavbar();

    expect(screen.getByRole("button", { name: "Open search and command menu" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Notifications/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Account menu for ${sampleUser.name}` })).toBeInTheDocument();
  });

  it("calls onOpenMobileNav when the hamburger button is clicked", async () => {
    const onOpenMobileNav = vi.fn();
    renderNavbar({ onOpenMobileNav });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open navigation menu" }));

    expect(onOpenMobileNav).toHaveBeenCalledTimes(1);
  });

  it("shows the unread notification count", () => {
    const unreadCount = sampleNotifications.filter((n) => !n.read).length;
    renderNavbar();

    expect(screen.getByRole("button", { name: `Notifications (${unreadCount} unread)` })).toBeInTheDocument();
  });

  it("renders breadcrumb items when provided", () => {
    renderNavbar({ breadcrumbs: [{ label: "Projects", href: "/projects" }, { label: "Travel Platform" }] });

    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
    expect(screen.getByText("Travel Platform")).toBeInTheDocument();
  });

  it("opens the command menu when the search trigger is activated", async () => {
    renderNavbar();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Open search and command menu" }));

    expect(useLayoutStore.getState().commandMenuOpen).toBe(true);
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = renderNavbar();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});

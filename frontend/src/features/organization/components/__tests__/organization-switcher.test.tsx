import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { OrganizationSwitcher } from "../organization-switcher";
import { useOrganizationStore } from "../../store/organization.store";
import type { Organization } from "../../types/organization.types";

const orgs: Organization[] = [
  {
    id: "org_demo",
    name: "Acme Corporation",
    slug: "acme",
    description: "Demo",
    industry: "technology",
    timezone: "UTC",
    language: "en",
    dateFormat: "MDY",
    branding: { primaryColor: "#2563EB", accentColor: "#0F172A" },
    memberCount: 3,
    activeProjectCount: 1,
    storageUsedGb: 1,
    storageLimitGb: 10,
    createdAt: "2024-01-01T00:00:00.000Z",
    myRole: "admin",
  },
];

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("../../hooks/use-organizations", () => ({
  useOrganizations: () => ({ data: orgs, isLoading: false }),
}));

describe("OrganizationSwitcher", () => {
  beforeEach(() => {
    useOrganizationStore.setState({
      currentOrganizationId: "org_demo",
      organizations: orgs,
      switcherOpen: false,
    });
  });

  it("renders the current organization name", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <OrganizationSwitcher />
      </QueryClientProvider>
    );

    expect(
      screen.getByRole("button", { name: /switch organization, current: acme corporation/i })
    ).toBeInTheDocument();
  });
});

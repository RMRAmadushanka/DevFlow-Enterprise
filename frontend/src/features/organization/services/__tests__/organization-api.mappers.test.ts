import { describe, expect, it } from "vitest";

import type { Membership, Organization } from "@/lib/api/types/organization";

import {
  toBackendOrgRole,
  toUiInvitation,
  toUiMember,
  toUiOrgRole,
  toUiOrganization,
} from "../organization-api.mappers";

const sampleOrg: Organization = {
  id: "org1",
  name: "Acme",
  slug: "acme",
  description: "Engineering",
  logoUrl: null,
  status: "ACTIVE",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("organization-api.mappers", () => {
  it("maps org roles both directions", () => {
    expect(toUiOrgRole("OWNER")).toBe("owner");
    expect(toUiOrgRole("ADMIN")).toBe("admin");
    expect(toUiOrgRole("MEMBER")).toBe("developer");
    expect(toUiOrgRole("GUEST")).toBe("viewer");
    expect(toBackendOrgRole("owner")).toBe("OWNER");
    expect(toBackendOrgRole("manager")).toBe("MEMBER");
    expect(toBackendOrgRole("viewer")).toBe("GUEST");
  });

  it("maps organization DTO to UI model", () => {
    const ui = toUiOrganization(sampleOrg, { myRole: "admin", memberCount: 4 });
    expect(ui.id).toBe("org1");
    expect(ui.slug).toBe("acme");
    expect(ui.myRole).toBe("admin");
    expect(ui.memberCount).toBe(4);
    expect(ui.branding.primaryColor).toBeTruthy();
  });

  it("maps membership with user hydration", () => {
    const membership: Membership = {
      id: "mem1",
      organizationId: "org1",
      userId: "u1",
      roleCode: "ADMIN",
      status: "ACTIVE",
      joinedAt: "2026-02-01T00:00:00.000Z",
    };
    const member = toUiMember(membership, {
      id: "u1",
      externalIdentityId: "sub",
      username: "sam",
      email: "sam@acme.com",
      firstName: "Sam",
      lastName: "Rivera",
      displayName: "Sam Rivera",
      status: "ACTIVE",
      notifyEmail: true,
      notifyInApp: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(member.role).toBe("admin");
    expect(member.name).toBe("Sam Rivera");
    expect(member.email).toBe("sam@acme.com");
    expect(member.status).toBe("active");
  });

  it("maps invitation status", () => {
    const invite = toUiInvitation({
      id: "inv1",
      organizationId: "org1",
      email: "new@acme.com",
      roleCode: "MEMBER",
      status: "PENDING",
      expiresAt: "2026-08-20T00:00:00.000Z",
      createdAt: "2026-08-06T00:00:00.000Z",
    });
    expect(invite.status).toBe("pending");
    expect(invite.role).toBe("developer");
  });
});

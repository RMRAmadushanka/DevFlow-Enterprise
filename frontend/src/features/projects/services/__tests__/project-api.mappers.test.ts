import { describe, expect, it } from "vitest";
import {
  toBackendMemberRole,
  toBackendSort,
  toBackendStatus,
  toBackendVisibility,
  toUiActivity,
  toUiHealth,
  toUiMember,
  toUiMemberRole,
  toUiStatus,
  toUiVisibility,
} from "../project-api.mappers";

describe("project-api.mappers", () => {
  it("maps status enums both ways", () => {
    expect(toUiStatus("ON_HOLD")).toBe("paused");
    expect(toBackendStatus("paused")).toBe("ON_HOLD");
    expect(toUiStatus("ARCHIVED")).toBe("archived");
  });

  it("maps visibility enums both ways", () => {
    expect(toUiVisibility("ORGANIZATION")).toBe("internal");
    expect(toBackendVisibility("internal")).toBe("ORGANIZATION");
    expect(toUiVisibility("TEAM")).toBe("private");
    expect(toBackendVisibility("public")).toBe("ORGANIZATION");
  });

  it("maps health and sort", () => {
    expect(toUiHealth("AT_RISK")).toBe("at_risk");
    expect(toBackendSort("newest")).toBe("createdAt,desc");
    expect(toBackendSort("name")).toBe("name,asc");
  });

  it("maps PROJECT_* roles to UI roles", () => {
    expect(toUiMemberRole("PROJECT_OWNER")).toBe("owner");
    expect(toUiMemberRole("PROJECT_ADMIN")).toBe("admin");
    expect(toUiMemberRole("PROJECT_MANAGER")).toBe("manager");
    expect(toUiMemberRole("PROJECT_DEVELOPER")).toBe("developer");
    expect(toUiMemberRole("PROJECT_VIEWER")).toBe("viewer");
    expect(toBackendMemberRole("owner")).toBe("PROJECT_OWNER");
  });

  it("maps members and activity DTOs", () => {
    const member = toUiMember(
      {
        id: "m1",
        projectId: "p1",
        userId: "u-12345678-abcd",
        role: "PROJECT_DEVELOPER",
        status: "ACTIVE",
        joinedAt: "2026-01-01T00:00:00Z",
      },
      { name: "Ada", email: "ada@example.com" }
    );
    expect(member.userId).toBe("u-12345678-abcd");
    expect(member.name).toBe("Ada");
    expect(member.role).toBe("developer");

    const activity = toUiActivity({
      id: "a1",
      projectId: "p1",
      actorUserId: "u1",
      activityType: "PROJECT_STATUS_CHANGED",
      description: "Status changed to ACTIVE",
      createdAt: "2026-01-02T00:00:00Z",
    });
    expect(activity.type).toBe("status_changed");
    expect(activity.summary).toContain("Status");
  });
});


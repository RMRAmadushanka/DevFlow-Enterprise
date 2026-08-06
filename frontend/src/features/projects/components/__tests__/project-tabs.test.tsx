import { describe, expect, it } from "vitest";

import { getActiveProjectTab, getProjectDetailTabs } from "../project-tabs";

describe("project tabs", () => {
  it("builds hrefs for known tabs", () => {
    const tabs = getProjectDetailTabs("proj_api");
    expect(tabs.find((tab) => tab.value === "overview")?.href).toBe("/projects/proj_api");
    expect(tabs.find((tab) => tab.value === "members")?.href).toBe(
      "/projects/proj_api/members"
    );
    expect(tabs.find((tab) => tab.value === "settings")?.href).toBe(
      "/projects/proj_api/settings"
    );
  });

  it("resolves the active tab from pathname", () => {
    expect(getActiveProjectTab("/projects/proj_api/analytics", "proj_api")).toBe("analytics");
    expect(getActiveProjectTab("/projects/proj_api", "proj_api")).toBe("overview");
  });
});

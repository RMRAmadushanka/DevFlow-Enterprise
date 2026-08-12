import { describe, expect, it } from "vitest";

import { safeInternalPath } from "../safe-internal-path";

describe("safeInternalPath", () => {
  it("allows relative app paths", () => {
    expect(safeInternalPath("/projects", "/dashboard")).toBe("/projects");
    expect(safeInternalPath("/projects?x=1", "/dashboard")).toBe("/projects?x=1");
  });

  it("blocks protocol-relative and scheme redirects", () => {
    expect(safeInternalPath("//evil.example", "/dashboard")).toBe("/dashboard");
    expect(safeInternalPath("/\\evil", "/dashboard")).toBe("/dashboard");
    expect(safeInternalPath("https://evil.example", "/dashboard")).toBe("/dashboard");
  });

  it("falls back for empty values", () => {
    expect(safeInternalPath(null, "/dashboard")).toBe("/dashboard");
    expect(safeInternalPath("", "/dashboard")).toBe("/dashboard");
  });
});

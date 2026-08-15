import { describe, expect, it } from "vitest";

import { decodeJwtPayload, mapRealmRolesToUiRole } from "../jwt";

function encodePart(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

describe("jwt helpers", () => {
  it("decodes JWT payload claims", () => {
    const token = `hdr.${encodePart({
      sub: "user-1",
      email: "dev@devflow.local",
      preferred_username: "developer",
      realm_access: { roles: ["DEVELOPER"] },
    })}.sig`;

    const claims = decodeJwtPayload(token);
    expect(claims?.sub).toBe("user-1");
    expect(claims?.email).toBe("dev@devflow.local");
    expect(claims?.realm_access?.roles).toContain("DEVELOPER");
  });

  it("maps realm roles to UI roles", () => {
    expect(mapRealmRolesToUiRole(["SUPER_ADMIN"])).toBe("admin");
    expect(mapRealmRolesToUiRole(["MANAGER"])).toBe("manager");
    expect(mapRealmRolesToUiRole(["DEVELOPER"])).toBe("developer");
    expect(mapRealmRolesToUiRole(["VIEWER"])).toBe("viewer");
    expect(mapRealmRolesToUiRole([])).toBe("developer");
    expect(mapRealmRolesToUiRole(["USER", "ADMIN", "DEVELOPER"])).toBe("admin");
  });
});

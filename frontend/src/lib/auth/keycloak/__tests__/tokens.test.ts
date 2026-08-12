import { describe, expect, it } from "vitest";

import { getAccessToken, isAuthenticated } from "../tokens";

/**
 * Tokens are held by the Keycloak JS adapter in memory.
 * Without a browser Keycloak instance these accessors return null/false.
 */
describe("keycloak in-memory tokens", () => {
  it("returns null access token when Keycloak is not configured", () => {
    expect(getAccessToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });
});

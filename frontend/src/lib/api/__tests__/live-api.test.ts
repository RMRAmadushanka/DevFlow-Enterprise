import { afterEach, describe, expect, it } from "vitest";

import { isLiveBackendMode, resolveLiveApiFlag } from "../live-api";

describe("resolveLiveApiFlag", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("disables live API without Keycloak even when API URL is set", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";
    delete process.env.NEXT_PUBLIC_KEYCLOAK_URL;
    expect(resolveLiveApiFlag(undefined)).toBe(false);
    expect(resolveLiveApiFlag("true")).toBe(false);
    expect(isLiveBackendMode()).toBe(false);
  });

  it("enables live API when Gateway + Keycloak are configured", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";
    process.env.NEXT_PUBLIC_KEYCLOAK_URL = "http://localhost:8180";
    expect(resolveLiveApiFlag(undefined)).toBe(true);
    expect(resolveLiveApiFlag("true")).toBe(true);
    expect(isLiveBackendMode()).toBe(true);
  });

  it("respects explicit false", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";
    process.env.NEXT_PUBLIC_KEYCLOAK_URL = "http://localhost:8180";
    expect(resolveLiveApiFlag("false")).toBe(false);
  });
});

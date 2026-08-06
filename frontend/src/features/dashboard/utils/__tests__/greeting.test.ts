import { describe, expect, it } from "vitest";

import { getTimeOfDayGreeting } from "../greeting";

describe("getTimeOfDayGreeting", () => {
  it("returns morning before noon", () => {
    expect(getTimeOfDayGreeting(new Date("2026-08-02T09:00:00"))).toBe("Good morning");
  });

  it("returns afternoon in the afternoon", () => {
    expect(getTimeOfDayGreeting(new Date("2026-08-02T15:00:00"))).toBe("Good afternoon");
  });

  it("returns evening after 18:00", () => {
    expect(getTimeOfDayGreeting(new Date("2026-08-02T20:00:00"))).toBe("Good evening");
  });
});

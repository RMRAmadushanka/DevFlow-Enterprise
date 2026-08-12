import { describe, expect, it } from "vitest";

import type { User, UserPreference } from "@/lib/api/types/user";

import {
  fromNotifyFlags,
  toAuthUserProfile,
  toNotifyFlags,
  toUpdateProfileRequest,
  toUserSearchResult,
} from "../user-api.mappers";

const sampleUser: User = {
  id: "u1",
  externalIdentityId: "sub-1",
  username: "ada",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  displayName: "Ada L.",
  avatarUrl: null,
  timezone: "UTC",
  locale: "en",
  status: "ACTIVE",
  theme: "system",
  notifyEmail: true,
  notifyInApp: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("user-api.mappers", () => {
  it("maps user DTO to auth profile", () => {
    const profile = toAuthUserProfile(sampleUser);
    expect(profile.id).toBe("u1");
    expect(profile.email).toBe("ada@example.com");
    expect(profile.name).toBe("Ada L.");
    expect(profile.timezone).toBe("UTC");
  });

  it("maps profile update payload", () => {
    expect(
      toUpdateProfileRequest({
        firstName: "Ada",
        lastName: "Lovelace",
        timezone: "America/New_York",
        avatarUrl: null,
      })
    ).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
      displayName: "Ada Lovelace",
      avatarUrl: null,
      timezone: "America/New_York",
    });
  });

  it("maps notification preferences to notify flags", () => {
    expect(
      toNotifyFlags({
        emailProduct: true,
        emailSecurity: false,
        emailMarketing: false,
        inAppMentions: false,
        inAppDeployments: true,
      })
    ).toEqual({ notifyEmail: true, notifyInApp: true });
  });

  it("maps notify flags back to notification UI", () => {
    const prefs: UserPreference = {
      userId: "u1",
      theme: "dark",
      notifyEmail: true,
      notifyInApp: false,
    };
    expect(fromNotifyFlags(prefs)).toMatchObject({
      emailProduct: true,
      emailSecurity: true,
      inAppMentions: false,
    });
  });

  it("maps search result", () => {
    expect(toUserSearchResult(sampleUser)).toEqual({
      id: "u1",
      email: "ada@example.com",
      name: "Ada L.",
      avatarUrl: undefined,
      username: "ada",
    });
  });
});

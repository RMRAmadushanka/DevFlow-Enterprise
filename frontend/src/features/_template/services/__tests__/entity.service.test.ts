import { describe, expect, it, vi, beforeEach } from "vitest";

import { entityService } from "../entity.service";

vi.mock("@/lib/api", () => ({
  apiClient: vi.fn(),
}));

import { apiClient } from "@/lib/api";

describe("entityService (feature template)", () => {
  beforeEach(() => {
    vi.mocked(apiClient).mockReset();
  });

  it("lists entities through the api client", async () => {
    vi.mocked(apiClient).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    });

    await entityService.list({ page: 1, pageSize: 20 });
    expect(apiClient).toHaveBeenCalledWith("/api/entities", {
      query: { page: 1, pageSize: 20 },
    });
  });

  it("fetches a single entity by id", async () => {
    vi.mocked(apiClient).mockResolvedValue({ id: "1" });
    await entityService.getById("1");
    expect(apiClient).toHaveBeenCalledWith("/api/entities/1");
  });
});

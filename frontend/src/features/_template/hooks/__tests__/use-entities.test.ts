import { describe, expect, it } from "vitest";

import { entityKeys } from "../use-entities";

describe("entityKeys (feature template)", () => {
  it("builds stable hierarchical keys", () => {
    expect(entityKeys.all).toEqual(["entities"]);
    expect(entityKeys.lists()).toEqual(["entities", "list"]);
    expect(entityKeys.list({ page: 1, pageSize: 20 })).toEqual([
      "entities",
      "list",
      { page: 1, pageSize: 20 },
    ]);
    expect(entityKeys.detail("abc")).toEqual(["entities", "detail", "abc"]);
  });
});

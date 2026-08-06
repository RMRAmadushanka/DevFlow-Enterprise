import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { useDocumentStore } from "../../store/document.store";
import { DocumentSearch } from "../document-search";

describe("DocumentSearch", () => {
  it("updates store search query", async () => {
    useDocumentStore.getState().resetFilters();
    const user = userEvent.setup();
    render(<DocumentSearch />);

    const input = screen.getByRole("searchbox", { name: /search documents/i });
    await user.type(input, "architecture");

    expect(useDocumentStore.getState().filters.q).toContain("architecture");
  });
});

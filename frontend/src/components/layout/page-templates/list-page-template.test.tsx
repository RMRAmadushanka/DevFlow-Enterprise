import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ListPageTemplate } from "./list-page-template";

describe("ListPageTemplate", () => {
  it("renders header, filters, content, and pagination", () => {
    render(
      <ListPageTemplate
        title="Items"
        description="All items"
        actions={<button type="button">New</button>}
        filters={<input aria-label="Search" />}
        pagination={<nav aria-label="Pagination">Page 1</nav>}
      >
        <table>
          <tbody>
            <tr>
              <td>Row</td>
            </tr>
          </tbody>
        </table>
      </ListPageTemplate>
    );

    expect(screen.getByRole("heading", { name: "Items" })).toBeInTheDocument();
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
    expect(screen.getByText("Row")).toBeInTheDocument();
    expect(screen.getByLabelText("Pagination")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
  });

  it("toggles view mode", async () => {
    const onViewModeChange = vi.fn();
    render(
      <ListPageTemplate
        title="Items"
        showViewToggle
        viewMode="table"
        onViewModeChange={onViewModeChange}
      >
        <div>Content</div>
      </ListPageTemplate>
    );

    await userEvent.setup().click(screen.getByRole("button", { name: "Card view" }));
    expect(onViewModeChange).toHaveBeenCalledWith("cards");
  });

  it("shows loading skeleton", () => {
    render(
      <ListPageTemplate title="Items" loading>
        <div>Hidden</div>
      </ListPageTemplate>
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Loading page")).toBeInTheDocument();
  });
});

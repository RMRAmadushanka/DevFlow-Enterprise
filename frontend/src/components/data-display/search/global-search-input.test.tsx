import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GlobalSearchInput } from "./global-search-input";
import { SearchResultItem } from "./search-result-item";

afterEach(() => {
  vi.useRealTimers();
});

describe("GlobalSearchInput", () => {
  it("reports typed values and clears them", async () => {
    const onChange = vi.fn();
    render(<GlobalSearchInput label="Search projects" onChange={onChange} shortcut={null} />);
    const user = userEvent.setup();

    const input = screen.getByRole("searchbox", { name: "Search projects" });
    await user.type(input, "api");
    expect(onChange).toHaveBeenLastCalledWith("api");

    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("fires onSearch with the debounced value", async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    const { rerender } = render(
      <GlobalSearchInput value="" onSearch={onSearch} debounceMs={200} shortcut={null} />
    );

    onSearch.mockClear();
    rerender(<GlobalSearchInput value="deploy" onSearch={onSearch} debounceMs={200} shortcut={null} />);

    expect(onSearch).not.toHaveBeenCalledWith("deploy");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(onSearch).toHaveBeenCalledWith("deploy");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<GlobalSearchInput shortcut={null} />);
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});

describe("SearchResultItem", () => {
  it("invokes onSelect when activated", async () => {
    const onSelect = vi.fn();
    render(
      <SearchResultItem title="API Gateway" description="Service" category="Service" onSelect={onSelect} />
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /API Gateway/ }));
    expect(onSelect).toHaveBeenCalled();
  });
});

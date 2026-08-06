import { useState } from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import type { ColumnDef, RowSelectionState, SortingState } from "@tanstack/react-table";

import { DataTable } from "./data-table";

type Row = { id: string; name: string; status: string };

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "status", header: "Status" },
];

const data: Row[] = [
  { id: "1", name: "Alpha", status: "Active" },
  { id: "2", name: "Beta", status: "Paused" },
  { id: "3", name: "Gamma", status: "Active" },
];

describe("DataTable", () => {
  it("renders headers and rows", () => {
    render(<DataTable columns={columns} data={data} getRowId={(row) => row.id} enablePagination={false} />);
    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("filters rows via the toolbar search", async () => {
    function Harness() {
      const [globalFilter, setGlobalFilter] = useState("");
      return (
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          enablePagination={false}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      );
    }

    render(<Harness />);
    const user = userEvent.setup();

    await user.type(screen.getByRole("searchbox"), "Beta");

    await waitFor(() => {
      expect(screen.getByText("Beta")).toBeInTheDocument();
      expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    });
  });

  it("sorts a column when its header is activated", async () => {
    function Harness() {
      const [sorting, setSorting] = useState<SortingState>([]);
      return (
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          enablePagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      );
    }

    render(<Harness />);
    const user = userEvent.setup();

    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "none");

    await user.click(screen.getByRole("columnheader", { name: /Name/ }));
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "ascending");

    await user.click(screen.getByRole("columnheader", { name: /Name/ }));
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "descending");
    await waitFor(() => {
      expect(within(screen.getAllByRole("row")[1]).getByText("Gamma")).toBeInTheDocument();
    });
  });

  it("selects rows and exposes bulk actions", async () => {
    function Harness() {
      const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
      return (
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          enableRowSelection
          enablePagination={false}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          bulkActions={({ selectedRows }) => (
            <button type="button">Bulk {selectedRows.length}</button>
          )}
        />
      );
    }

    render(<Harness />);
    const user = userEvent.setup();

    const rowCheckbox = screen.getAllByRole("checkbox", { name: "Select row" })[0];
    await user.click(rowCheckbox);

    await waitFor(() => {
      expect(screen.getByText("1 selected")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Bulk 1" })).toBeInTheDocument();
    });
  });

  it("shows a loading skeleton", () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} loading enablePagination={false} />
    );
    expect(container.querySelector("[aria-busy='true']")).toBeInTheDocument();
  });

  it("shows an empty state when there is no data", () => {
    render(<DataTable columns={columns} data={[]} enablePagination={false} />);
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <DataTable columns={columns} data={data} getRowId={(row) => row.id} enablePagination={false} />
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});

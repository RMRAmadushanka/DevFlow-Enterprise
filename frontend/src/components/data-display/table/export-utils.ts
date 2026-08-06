import type { Table } from "@tanstack/react-table";

/** Flatten visible (non-action) columns into a CSV string and trigger a download. */
export function exportTableToCsv<TData>(table: Table<TData>, filename = "export"): void {
  const columns = table
    .getVisibleLeafColumns()
    .filter((column) => column.id !== "select" && column.id !== "actions" && column.id !== "expander");

  const headers = columns.map((column) => {
    const header = column.columnDef.header;
    return typeof header === "string" ? header : column.id;
  });

  const rows = table.getFilteredRowModel().rows.map((row) =>
    columns.map((column) => {
      const value = row.getValue(column.id);
      if (value == null) return "";
      const text = typeof value === "object" ? JSON.stringify(value) : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    })
  );

  const csv = [headers.join(","), ...rows.map((cells) => cells.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filename}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

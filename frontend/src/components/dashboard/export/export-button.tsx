"use client";

import * as React from "react";
import { Check, Download, Loader2, AlertCircle, FileText, FileSpreadsheet, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExportFormat } from "@/components/dashboard/shared/types";
import type { ExportButtonProps } from "./types";

const FORMAT_META: Record<ExportFormat, { label: string; icon: React.ReactNode }> = {
  pdf: { label: "PDF", icon: <FileText /> },
  csv: { label: "CSV", icon: <FileDown /> },
  excel: { label: "Excel", icon: <FileSpreadsheet /> },
};

/**
 * Export menu for dashboard widgets — PDF / CSV / Excel with loading/success/error chrome.
 * Does not perform the export itself; callers handle `onExport`.
 */
function ExportButton({
  formats = ["pdf", "csv", "excel"],
  onExport,
  status = "idle",
  disabled,
  className,
  label = "Export",
}: ExportButtonProps) {
  const busy = status === "loading";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || busy}
            className={className}
            aria-label={label}
            data-status={status}
          />
        }
      >
        {busy ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : status === "success" ? (
          <Check className="text-success" aria-hidden="true" />
        ) : status === "error" ? (
          <AlertCircle className="text-danger" aria-hidden="true" />
        ) : (
          <Download aria-hidden="true" />
        )}
        <span>
          {busy ? "Exporting…" : status === "success" ? "Exported" : status === "error" ? "Failed" : label}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Export as</DropdownMenuLabel>
          {formats.map((format) => (
            <DropdownMenuItem
              key={format}
              disabled={busy}
              onClick={() => {
                void onExport(format);
              }}
            >
              {FORMAT_META[format].icon}
              <span>{FORMAT_META[format].label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ExportButton };

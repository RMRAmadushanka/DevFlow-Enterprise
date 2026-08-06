import type { ExportFormat, ExportStatus } from "@/components/dashboard/shared/types";

export interface ExportButtonProps {
  /** Formats offered in the menu. @default pdf, csv, excel */
  formats?: ExportFormat[];
  /** Called when the user picks a format. Parent owns the export work. */
  onExport: (format: ExportFormat) => void | Promise<void>;
  status?: ExportStatus;
  disabled?: boolean;
  className?: string;
  label?: string;
}

import type { FileKind, FileMeta } from "./types";

const EXTENSION_KIND: Record<string, FileKind> = {
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  pdf: "pdf",
  doc: "document",
  docx: "document",
  txt: "document",
  md: "document",
  xls: "spreadsheet",
  xlsx: "spreadsheet",
  csv: "spreadsheet",
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  mp4: "video",
  mov: "video",
  webm: "video",
  mp3: "audio",
  wav: "audio",
};

/** Infer a coarse file kind from mime type or filename extension. */
export function resolveFileKind(file: Pick<FileMeta, "name" | "mimeType" | "kind">): FileKind {
  if (file.kind) return file.kind;
  if (file.mimeType) {
    if (file.mimeType.startsWith("image/")) return "image";
    if (file.mimeType === "application/pdf") return "pdf";
    if (file.mimeType.startsWith("video/")) return "video";
    if (file.mimeType.startsWith("audio/")) return "audio";
    if (file.mimeType.includes("sheet") || file.mimeType.includes("excel")) return "spreadsheet";
    if (file.mimeType.includes("zip") || file.mimeType.includes("compressed")) return "archive";
    if (file.mimeType.startsWith("text/") || file.mimeType.includes("document")) return "document";
  }
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_KIND[extension] ?? "other";
}

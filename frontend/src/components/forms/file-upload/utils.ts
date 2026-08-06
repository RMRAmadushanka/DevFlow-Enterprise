import type { UploadFile } from "./types";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

/** Parses an `accept` string (`.png,.jpg,application/pdf`) into extension and MIME matchers. */
function parseAccept(accept: string) {
  const parts = accept.split(",").map((part) => part.trim().toLowerCase()).filter(Boolean);
  return {
    extensions: parts.filter((part) => part.startsWith(".")),
    mimes: parts.filter((part) => !part.startsWith(".")),
  };
}

export function isFileAccepted(file: File, accept?: string): boolean {
  if (!accept) return true;
  const { extensions, mimes } = parseAccept(accept);
  if (extensions.length === 0 && mimes.length === 0) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  const extensionMatch = extensions.some((ext) => name.endsWith(ext));
  const mimeMatch = mimes.some((mime) => {
    if (mime.endsWith("/*")) return type.startsWith(mime.slice(0, -1));
    return type === mime;
  });

  return extensionMatch || mimeMatch;
}

export function createUploadFile(file: File, showPreviews: boolean): UploadFile {
  return {
    id: crypto.randomUUID(),
    file,
    status: "idle",
    progress: 0,
    previewUrl: showPreviews && file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
  };
}

export function revokePreview(uploadFile: UploadFile) {
  if (uploadFile.previewUrl) URL.revokeObjectURL(uploadFile.previewUrl);
}

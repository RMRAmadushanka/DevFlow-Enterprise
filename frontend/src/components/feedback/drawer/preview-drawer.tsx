"use client";

import * as React from "react";

import { Drawer } from "./drawer";
import type { PreviewDrawerProps } from "./types";

/**
 * Preview panel for documents, files, and images — optional media slot
 * above the body content.
 */
function PreviewDrawer({ preview, children, size = "lg", ...props }: PreviewDrawerProps) {
  return (
    <Drawer {...props} size={size}>
      <div className="flex flex-col gap-4">
        {preview ? (
          <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
            {preview}
          </div>
        ) : null}
        {children}
      </div>
    </Drawer>
  );
}

export { PreviewDrawer };

"use client";

import { DocumentsView } from "./documents-view";

function SharedView() {
  return (
    <DocumentsView
      title="Shared with me"
      description="Documents others have shared with you."
      sharedOnly
    />
  );
}

export { SharedView };

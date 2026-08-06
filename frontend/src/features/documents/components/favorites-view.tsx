"use client";

import { DocumentsView } from "./documents-view";

function FavoritesView() {
  return (
    <DocumentsView
      title="Favorites"
      description="Documents you have starred for quick access."
      favoritesOnly
    />
  );
}

export { FavoritesView };

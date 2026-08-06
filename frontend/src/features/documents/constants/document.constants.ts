import { createQueryKeys } from "@/lib/api/query-keys";

import type {
  DocumentFilters,
  DocumentSortField,
  DocumentTemplateCategory,
  DocumentVisibility,
} from "../types/document.types";

export const DOCUMENT_STORAGE_KEY = "devflow.documents.ui";

export const documentKeys = {
  ...createQueryKeys("documents"),
  history: (id: string) => [...createQueryKeys("documents").detail(id), "history"] as const,
  comments: (id: string) => [...createQueryKeys("documents").detail(id), "comments"] as const,
  search: (q: string) => [...createQueryKeys("documents").all, "search", q] as const,
  templates: (category?: string | null) =>
    [...createQueryKeys("documents").all, "templates", category ?? "all"] as const,
  favorites: () => [...createQueryKeys("documents").all, "favorites"] as const,
  recent: () => [...createQueryKeys("documents").all, "recent"] as const,
  shared: () => [...createQueryKeys("documents").all, "shared"] as const,
  tree: () => [...createQueryKeys("documents").all, "tree"] as const,
};

export const DEFAULT_DOCUMENT_FILTERS: DocumentFilters = {
  q: "",
  folderId: null,
  tag: null,
  authorId: null,
  visibility: "all",
  favoritesOnly: false,
  updatedFrom: null,
  updatedTo: null,
  sharedOnly: false,
  trashOnly: false,
};

export const VISIBILITY_LABELS: Record<DocumentVisibility, string> = {
  private: "Private",
  workspace: "Workspace",
  public: "Public",
  restricted: "Restricted",
};

export const VISIBILITY_OPTIONS: Array<{
  value: DocumentVisibility | "all";
  label: string;
}> = [
  { value: "all", label: "All visibility" },
  { value: "private", label: "Private" },
  { value: "workspace", label: "Workspace" },
  { value: "restricted", label: "Restricted" },
  { value: "public", label: "Public" },
];

export const SORT_OPTIONS: Array<{ value: DocumentSortField; label: string }> = [
  { value: "recently_updated", label: "Recently updated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
  { value: "alphabetical", label: "Alphabetical" },
];

export const TEMPLATE_CATEGORY_LABELS: Record<DocumentTemplateCategory, string> = {
  engineering: "Engineering",
  meeting_notes: "Meeting Notes",
  architecture: "Architecture",
  rfc: "RFC",
  sprint_review: "Sprint Review",
  retrospective: "Retrospective",
  api_documentation: "API Documentation",
  project_proposal: "Project Proposal",
};

export const TEMPLATE_CATEGORY_OPTIONS: Array<{
  value: DocumentTemplateCategory | "all";
  label: string;
}> = [
  { value: "all", label: "All categories" },
  ...Object.entries(TEMPLATE_CATEGORY_LABELS).map(([value, label]) => ({
    value: value as DocumentTemplateCategory,
    label,
  })),
];

export const DOCUMENT_DETAIL_TABS = [
  { value: "content", label: "Content" },
  { value: "comments", label: "Comments" },
  { value: "history", label: "History" },
  { value: "analytics", label: "Analytics" },
  { value: "permissions", label: "Permissions" },
] as const;

export const FOLDER_OPTIONS = [
  { value: "folder_eng", label: "Engineering" },
  { value: "folder_product", label: "Product" },
  { value: "folder_ops", label: "Operations" },
  { value: "folder_hr", label: "People" },
];

export const AUTHOR_OPTIONS = [
  { value: "user_ava", label: "Ava Chen" },
  { value: "user_leo", label: "Leo Martins" },
  { value: "user_mia", label: "Mia Patel" },
  { value: "user_noah", label: "Noah Kim" },
];

export const DOCUMENT_ICONS = ["📄", "📘", "📐", "🧪", "🗂", "💡", "🛠", "📝"] as const;

export const MAX_DESCRIPTION_LENGTH = 500;

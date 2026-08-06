export type DocumentVisibility = "private" | "workspace" | "public" | "restricted";

export type DocumentAccessRole = "owner" | "editor" | "commenter" | "viewer";

export type DocumentSharePermission = "view" | "comment" | "edit";

export type DocumentViewMode = "table" | "grid" | "list";

export type DocumentEditorMode = "rich" | "markdown";

export type DocumentSortField =
  | "name"
  | "recently_updated"
  | "oldest"
  | "newest"
  | "alphabetical";

export type DocumentSidebarSection =
  | "workspace"
  | "favorites"
  | "recent"
  | "shared"
  | "templates"
  | "folders"
  | "trash";

export type DocumentDetailTab =
  | "content"
  | "comments"
  | "history"
  | "analytics"
  | "permissions";

export type DocumentTemplateCategory =
  | "engineering"
  | "meeting_notes"
  | "architecture"
  | "rfc"
  | "sprint_review"
  | "retrospective"
  | "api_documentation"
  | "project_proposal";

export interface DocumentFilters {
  q: string;
  folderId: string | null;
  tag: string | null;
  authorId: string | null;
  visibility: DocumentVisibility | "all";
  favoritesOnly: boolean;
  updatedFrom: string | null;
  updatedTo: string | null;
  sharedOnly: boolean;
  trashOnly: boolean;
}

export interface DocumentOwner {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface DocumentPermissionEntry {
  id: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  role: DocumentAccessRole;
}

export interface DocumentAnalytics {
  views: number;
  comments: number;
  versions: number;
  editors: number;
  readingTimeMinutes: number;
  lastUpdated: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  authorId: string;
  authorName: string;
  summary: string;
  createdAt: string;
  contentHtml: string;
  contentMarkdown: string;
}

export interface DocumentActivityItem {
  id: string;
  actorName: string;
  summary: string;
  timestamp: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  parentId: string | null;
  documentCount: number;
  children?: DocumentFolder[];
}

export interface DocumentTreeNode {
  id: string;
  title: string;
  parentId: string | null;
  folderId: string | null;
  icon?: string;
  isFolder: boolean;
  documentCount?: number;
  children: DocumentTreeNode[];
}

export interface Document {
  id: string;
  title: string;
  description: string;
  icon: string;
  coverImageUrl?: string;
  folderId: string | null;
  folderName?: string;
  parentId: string | null;
  tags: string[];
  visibility: DocumentVisibility;
  favorited: boolean;
  archived: boolean;
  trashed: boolean;
  shared: boolean;
  owner: DocumentOwner;
  contentHtml: string;
  contentMarkdown: string;
  wordCount: number;
  readingTimeMinutes: number;
  version: number;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
}

export interface DocumentDetail extends Document {
  permissions: DocumentPermissionEntry[];
  analytics: DocumentAnalytics;
  activity: DocumentActivityItem[];
  breadcrumb: Array<{ id: string; title: string }>;
}

export interface DocumentListResult {
  items: Document[];
  total: number;
  folders: DocumentFolder[];
  tree: DocumentTreeNode[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: DocumentTemplateCategory;
  icon: string;
  contentHtml: string;
  contentMarkdown: string;
  tags: string[];
}

export interface CreateDocumentPayload {
  title: string;
  description?: string;
  folderId?: string | null;
  parentId?: string | null;
  tags?: string[];
  visibility?: DocumentVisibility;
  templateId?: string | null;
  icon?: string;
  coverImageUrl?: string;
  contentHtml?: string;
  contentMarkdown?: string;
}

export interface UpdateDocumentPayload {
  title?: string;
  description?: string;
  folderId?: string | null;
  parentId?: string | null;
  tags?: string[];
  visibility?: DocumentVisibility;
  icon?: string;
  coverImageUrl?: string;
  contentHtml?: string;
  contentMarkdown?: string;
  favorited?: boolean;
  archived?: boolean;
  trashed?: boolean;
}

export interface ShareDocumentPayload {
  visibility: DocumentVisibility;
  userIds?: string[];
  permission?: DocumentSharePermission;
  publicLinkEnabled?: boolean;
}

export interface MoveDocumentPayload {
  folderId: string | null;
  parentId?: string | null;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  bodyHtml: string;
  resolved: boolean;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: DocumentComment[];
}

export interface CreateDocumentCommentPayload {
  bodyHtml: string;
  parentId?: string | null;
}

export interface UpdateDocumentCommentPayload {
  bodyHtml?: string;
  resolved?: boolean;
}

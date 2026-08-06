export { DocumentEmptyState } from "./components/document-empty-state";
export type { DocumentEmptyVariant } from "./components/document-empty-state";

export {
  DocumentSkeleton,
  EditorSkeleton,
  SidebarSkeleton,
  CommentSkeleton,
  HistorySkeleton,
  DocumentTableSkeleton,
  DocumentGridSkeleton,
} from "./components/document-skeleton";

export { FavoriteButton } from "./components/favorite-button";
export { DocumentSearch } from "./components/document-search";
export { DocumentFilters } from "./components/document-filters";
export { DocumentCard } from "./components/document-card";
export { DocumentTable } from "./components/document-table";
export { DocumentGrid } from "./components/document-grid";
export { DocumentBreadcrumb } from "./components/document-breadcrumb";
export { DocumentHeader } from "./components/document-header";
export { DocumentToolbar, AutoSaveIndicator } from "./components/document-toolbar";
export { DocumentTree } from "./components/document-tree";
export { DocumentSidebar } from "./components/document-sidebar";
export { DocumentLayout } from "./components/document-layout";
export { DocumentPreview } from "./components/document-preview";
export { DocumentViewer } from "./components/document-viewer";
export { MarkdownEditor } from "./components/markdown-editor";
export { DocumentEditor } from "./components/document-editor";
export { DocumentActivity } from "./components/document-activity";
export { CommentEditor } from "./components/comment-editor";
export { CommentThread } from "./components/comment-thread";
export { DocumentComments } from "./components/document-comments";
export { DocumentHistory, VersionHistory } from "./components/document-history";
export { DocumentTemplateCard } from "./components/document-template-card";
export { TemplateGallery } from "./components/template-gallery";
export { ShareDocumentModal } from "./components/share-document-modal";
export { PermissionModal, PermissionsPanel } from "./components/permission-modal";
export { MoveDocumentModal } from "./components/move-document-modal";
export { DeleteDocumentModal } from "./components/delete-document-modal";
export { RestoreVersionModal } from "./components/restore-version-modal";
export { DocumentAnalytics } from "./components/document-analytics";
export { RecentDocuments } from "./components/recent-documents";
export { PinnedDocuments } from "./components/pinned-documents";
export { DocumentForm } from "./components/document-form";
export { DocumentsView } from "./components/documents-view";
export { DocumentDetailShell } from "./components/document-detail-shell";
export { DocumentQuickActions, DocumentQuickActionsBar } from "./components/document-quick-actions";
export { CreateDocumentModal } from "./components/create-document-modal";
export { FavoritesView } from "./components/favorites-view";
export { RecentView } from "./components/recent-view";
export { SharedView } from "./components/shared-view";
export { TemplatesView } from "./components/templates-view";

export {
  useDocuments,
  useDocumentsList,
  useDocument,
  useDocumentDetail,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useDuplicateDocument,
  useArchiveDocument,
  useToggleFavorite,
  useShareDocument,
  useMoveDocument,
  useDocumentHistory,
  useRestoreVersion,
  useDocumentSearch,
  useDocumentFavorites,
  useRecentDocuments,
  useSharedDocuments,
  useDocumentTree,
  useDocumentTemplates,
  useDocumentComments,
  useCreateDocumentComment,
  useUpdateDocumentComment,
  useDeleteDocumentComment,
} from "./hooks/use-documents";

export { useDocumentStore } from "./store/document.store";

export * from "./schemas/document.schema";
export * from "./schemas/comment.schema";
export * from "./types/document.types";

export {
  documentKeys,
  DOCUMENT_STORAGE_KEY,
  DEFAULT_DOCUMENT_FILTERS,
  VISIBILITY_LABELS,
  VISIBILITY_OPTIONS,
  SORT_OPTIONS,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_OPTIONS,
  DOCUMENT_DETAIL_TABS,
  FOLDER_OPTIONS,
  AUTHOR_OPTIONS,
  DOCUMENT_ICONS,
  MAX_DESCRIPTION_LENGTH,
} from "./constants/document.constants";

export {
  stripHtml,
  countWords,
  estimateReadingTimeMinutes,
  formatDocumentDate,
  buildBreadcrumb,
} from "./utils/content";
export { toDocumentErrorMessage } from "./utils/errors";

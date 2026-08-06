import type {
  Document,
  DocumentComment,
  DocumentDetail,
  DocumentTemplate,
  DocumentVersion,
} from "../../types/document.types";

export const sampleDocument: Document = {
  id: "doc_architecture",
  title: "Platform Architecture Overview",
  description: "High-level system context for DevFlow Enterprise services.",
  icon: "📐",
  folderId: "folder_eng",
  folderName: "Engineering",
  parentId: null,
  tags: ["architecture", "platform"],
  visibility: "workspace",
  favorited: true,
  archived: false,
  trashed: false,
  shared: true,
  owner: { id: "user_ava", name: "Ava Chen" },
  contentHtml:
    "<h1>Platform Architecture</h1><p>DevFlow Enterprise knowledge base.</p>",
  contentMarkdown: "# Platform Architecture\n\nDevFlow Enterprise knowledge base.\n",
  wordCount: 6,
  readingTimeMinutes: 1,
  version: 4,
  templateId: "tpl_arch",
  createdAt: "2026-07-01T09:00:00.000Z",
  updatedAt: "2026-08-06T10:00:00.000Z",
  lastOpenedAt: "2026-08-06T09:30:00.000Z",
};

export const sampleDocumentDetail: DocumentDetail = {
  ...sampleDocument,
  permissions: [
    {
      id: "perm_owner",
      userId: "user_ava",
      userName: "Ava Chen",
      role: "owner",
    },
    {
      id: "perm_editor",
      userId: "user_leo",
      userName: "Leo Martins",
      role: "editor",
    },
  ],
  analytics: {
    views: 188,
    comments: 3,
    versions: 3,
    editors: 2,
    readingTimeMinutes: 1,
    lastUpdated: sampleDocument.updatedAt,
  },
  activity: [
    {
      id: "act_1",
      actorName: "Ava Chen",
      summary: "Updated Platform Architecture Overview",
      timestamp: sampleDocument.updatedAt,
    },
  ],
  breadcrumb: [{ id: sampleDocument.id, title: sampleDocument.title }],
};

export const sampleComments: DocumentComment[] = [
  {
    id: "cmt_1",
    documentId: "doc_architecture",
    parentId: null,
    authorId: "user_leo",
    authorName: "Leo Martins",
    bodyHtml: "<p>Can we add a sequence diagram?</p>",
    resolved: false,
    edited: false,
    createdAt: "2026-08-03T09:00:00.000Z",
    updatedAt: "2026-08-03T09:00:00.000Z",
    replies: [],
  },
];

export const sampleVersions: DocumentVersion[] = [
  {
    id: "ver_arch_4",
    documentId: "doc_architecture",
    version: 4,
    authorId: "user_ava",
    authorName: "Ava Chen",
    summary: "Added knowledge domain section",
    createdAt: "2026-08-06T10:00:00.000Z",
    contentHtml: sampleDocument.contentHtml,
    contentMarkdown: sampleDocument.contentMarkdown,
  },
];

export const sampleTemplate: DocumentTemplate = {
  id: "tpl_eng",
  name: "Engineering Spec",
  description: "Structured technical specification.",
  category: "engineering",
  icon: "🛠",
  tags: ["engineering"],
  contentHtml: "<h1>Engineering Spec</h1>",
  contentMarkdown: "# Engineering Spec\n",
};

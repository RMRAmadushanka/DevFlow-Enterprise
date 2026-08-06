import { FOLDER_OPTIONS } from "../constants/document.constants";
import type {
  CreateDocumentPayload,
  Document,
  DocumentDetail,
  DocumentFilters,
  DocumentFolder,
  DocumentListResult,
  DocumentSortField,
  DocumentTreeNode,
  DocumentVersion,
  MoveDocumentPayload,
  ShareDocumentPayload,
  UpdateDocumentPayload,
} from "../types/document.types";
import { buildBreadcrumb, countWords, estimateReadingTimeMinutes } from "../utils/content";
import { DocumentNotFoundError, DocumentValidationError } from "../utils/errors";
import { templateService } from "./template.service";

const delay = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));

function folderName(id: string | null | undefined) {
  if (!id) return undefined;
  return FOLDER_OPTIONS.find((f) => f.value === id)?.label;
}

function seedDocuments(): Document[] {
  const now = "2026-08-06T10:00:00.000Z";
  return [
    {
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
        "<h1>Platform Architecture</h1><p>DevFlow Enterprise is organized around projects, tasks, sprints, and knowledge.</p><h2>Domains</h2><ul><li>Identity</li><li>Delivery</li><li>Knowledge</li></ul>",
      contentMarkdown:
        "# Platform Architecture\n\nDevFlow Enterprise is organized around projects, tasks, sprints, and knowledge.\n\n## Domains\n\n- Identity\n- Delivery\n- Knowledge\n",
      wordCount: 28,
      readingTimeMinutes: 1,
      version: 4,
      templateId: "tpl_arch",
      createdAt: "2026-07-01T09:00:00.000Z",
      updatedAt: now,
      lastOpenedAt: "2026-08-06T09:30:00.000Z",
      coverImageUrl: undefined,
    },
    {
      id: "doc_api_gateway",
      title: "API Gateway Handbook",
      description: "Operational runbook and endpoint conventions.",
      icon: "📄",
      folderId: "folder_eng",
      folderName: "Engineering",
      parentId: "doc_architecture",
      tags: ["api", "runbook"],
      visibility: "restricted",
      favorited: false,
      archived: false,
      trashed: false,
      shared: true,
      owner: { id: "user_leo", name: "Leo Martins" },
      contentHtml:
        "<h1>API Gateway Handbook</h1><p>Rate limits, auth headers, and deployment checklist.</p><pre><code>GET /v1/health</code></pre>",
      contentMarkdown:
        "# API Gateway Handbook\n\nRate limits, auth headers, and deployment checklist.\n\n```\nGET /v1/health\n```\n",
      wordCount: 12,
      readingTimeMinutes: 1,
      version: 2,
      templateId: "tpl_api",
      createdAt: "2026-07-12T11:00:00.000Z",
      updatedAt: "2026-08-05T16:00:00.000Z",
      lastOpenedAt: "2026-08-05T17:00:00.000Z",
    },
    {
      id: "doc_rfc_docs",
      title: "RFC: Unified Knowledge Base",
      description: "Proposal for a Notion-like documentation experience.",
      icon: "💡",
      folderId: "folder_product",
      folderName: "Product",
      parentId: null,
      tags: ["rfc", "docs"],
      visibility: "workspace",
      favorited: true,
      archived: false,
      trashed: false,
      shared: false,
      owner: { id: "user_mia", name: "Mia Patel" },
      contentHtml:
        "<h1>RFC: Unified Knowledge Base</h1><h2>Motivation</h2><p>Teams need a single place for specs, runbooks, and decisions.</p>",
      contentMarkdown:
        "# RFC: Unified Knowledge Base\n\n## Motivation\n\nTeams need a single place for specs, runbooks, and decisions.\n",
      wordCount: 18,
      readingTimeMinutes: 1,
      version: 3,
      templateId: "tpl_rfc",
      createdAt: "2026-07-20T08:00:00.000Z",
      updatedAt: "2026-08-04T12:00:00.000Z",
      lastOpenedAt: "2026-08-04T14:00:00.000Z",
    },
    {
      id: "doc_sprint_25_notes",
      title: "Sprint 25 Review Notes",
      description: "Demo notes and stakeholder feedback.",
      icon: "📘",
      folderId: "folder_eng",
      folderName: "Engineering",
      parentId: null,
      tags: ["sprint", "review"],
      visibility: "workspace",
      favorited: false,
      archived: false,
      trashed: false,
      shared: true,
      owner: { id: "user_noah", name: "Noah Kim" },
      contentHtml:
        "<h1>Sprint 25 Review</h1><ul><li>Gateway rate limiting shipped</li><li>Console a11y fixes verified</li></ul>",
      contentMarkdown:
        "# Sprint 25 Review\n\n- Gateway rate limiting shipped\n- Console a11y fixes verified\n",
      wordCount: 14,
      readingTimeMinutes: 1,
      version: 1,
      templateId: "tpl_sprint_review",
      createdAt: "2026-08-01T15:00:00.000Z",
      updatedAt: "2026-08-03T10:00:00.000Z",
      lastOpenedAt: "2026-08-03T11:00:00.000Z",
    },
    {
      id: "doc_onboarding",
      title: "Engineering Onboarding",
      description: "Private checklist for new engineers.",
      icon: "🗂",
      folderId: "folder_hr",
      folderName: "People",
      parentId: null,
      tags: ["onboarding"],
      visibility: "private",
      favorited: false,
      archived: false,
      trashed: false,
      shared: false,
      owner: { id: "user_ava", name: "Ava Chen" },
      contentHtml:
        "<h1>Engineering Onboarding</h1><ol><li>Set up local stack</li><li>Read architecture overview</li><li>Shadow a deployment</li></ol>",
      contentMarkdown:
        "# Engineering Onboarding\n\n1. Set up local stack\n2. Read architecture overview\n3. Shadow a deployment\n",
      wordCount: 16,
      readingTimeMinutes: 1,
      version: 5,
      createdAt: "2026-06-15T09:00:00.000Z",
      updatedAt: "2026-07-28T09:00:00.000Z",
      lastOpenedAt: "2026-07-28T10:00:00.000Z",
    },
    {
      id: "doc_archived_ops",
      title: "Legacy Ops Playbook",
      description: "Archived operational guide.",
      icon: "🛠",
      folderId: "folder_ops",
      folderName: "Operations",
      parentId: null,
      tags: ["ops", "legacy"],
      visibility: "workspace",
      favorited: false,
      archived: true,
      trashed: false,
      shared: false,
      owner: { id: "user_leo", name: "Leo Martins" },
      contentHtml: "<h1>Legacy Ops Playbook</h1><p>Superseded by platform runbooks.</p>",
      contentMarkdown: "# Legacy Ops Playbook\n\nSuperseded by platform runbooks.\n",
      wordCount: 6,
      readingTimeMinutes: 1,
      version: 8,
      createdAt: "2025-11-01T09:00:00.000Z",
      updatedAt: "2026-05-01T09:00:00.000Z",
    },
    {
      id: "doc_trash_draft",
      title: "Draft: Q4 Planning",
      description: "Trashed draft.",
      icon: "📝",
      folderId: "folder_product",
      folderName: "Product",
      parentId: null,
      tags: ["draft"],
      visibility: "private",
      favorited: false,
      archived: false,
      trashed: true,
      shared: false,
      owner: { id: "user_mia", name: "Mia Patel" },
      contentHtml: "<h1>Q4 Planning</h1><p>Draft content.</p>",
      contentMarkdown: "# Q4 Planning\n\nDraft content.\n",
      wordCount: 4,
      readingTimeMinutes: 1,
      version: 1,
      createdAt: "2026-07-30T09:00:00.000Z",
      updatedAt: "2026-07-30T09:00:00.000Z",
    },
  ];
}

let documents = seedDocuments();

const versionsByDoc: Record<string, DocumentVersion[]> = {
  doc_architecture: [
    {
      id: "ver_arch_4",
      documentId: "doc_architecture",
      version: 4,
      authorId: "user_ava",
      authorName: "Ava Chen",
      summary: "Added knowledge domain section",
      createdAt: "2026-08-06T10:00:00.000Z",
      contentHtml: documents.find((d) => d.id === "doc_architecture")!.contentHtml,
      contentMarkdown: documents.find((d) => d.id === "doc_architecture")!.contentMarkdown,
    },
    {
      id: "ver_arch_3",
      documentId: "doc_architecture",
      version: 3,
      authorId: "user_leo",
      authorName: "Leo Martins",
      summary: "Clarified service boundaries",
      createdAt: "2026-08-01T10:00:00.000Z",
      contentHtml: "<h1>Platform Architecture</h1><p>Earlier draft.</p>",
      contentMarkdown: "# Platform Architecture\n\nEarlier draft.\n",
    },
    {
      id: "ver_arch_2",
      documentId: "doc_architecture",
      version: 2,
      authorId: "user_ava",
      authorName: "Ava Chen",
      summary: "Initial structure",
      createdAt: "2026-07-15T10:00:00.000Z",
      contentHtml: "<h1>Platform Architecture</h1>",
      contentMarkdown: "# Platform Architecture\n",
    },
  ],
  doc_rfc_docs: [
    {
      id: "ver_rfc_3",
      documentId: "doc_rfc_docs",
      version: 3,
      authorId: "user_mia",
      authorName: "Mia Patel",
      summary: "Refined motivation",
      createdAt: "2026-08-04T12:00:00.000Z",
      contentHtml: documents.find((d) => d.id === "doc_rfc_docs")!.contentHtml,
      contentMarkdown: documents.find((d) => d.id === "doc_rfc_docs")!.contentMarkdown,
    },
  ],
};

function sortDocuments(items: Document[], sort: DocumentSortField): Document[] {
  const sorted = [...items];
  switch (sort) {
    case "name":
    case "alphabetical":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "oldest":
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case "newest":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "recently_updated":
    default:
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

function matchesFilters(doc: Document, filters: DocumentFilters): boolean {
  if (filters.trashOnly) {
    if (!doc.trashed) return false;
  } else if (doc.trashed) {
    return false;
  }

  if (filters.favoritesOnly && !doc.favorited) return false;
  if (filters.sharedOnly && !doc.shared) return false;
  if (filters.folderId && doc.folderId !== filters.folderId) return false;
  if (filters.tag && !doc.tags.includes(filters.tag)) return false;
  if (filters.authorId && doc.owner.id !== filters.authorId) return false;
  if (filters.visibility !== "all" && doc.visibility !== filters.visibility) return false;
  if (filters.updatedFrom && doc.updatedAt < filters.updatedFrom) return false;
  if (filters.updatedTo && doc.updatedAt > filters.updatedTo) return false;

  const q = filters.q.trim().toLowerCase();
  if (q) {
    const haystack = [
      doc.title,
      doc.description,
      doc.contentMarkdown,
      doc.tags.join(" "),
      doc.owner.name,
      doc.folderName ?? "",
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  return true;
}

function buildFolders(): DocumentFolder[] {
  return FOLDER_OPTIONS.map((folder) => ({
    id: folder.value,
    name: folder.label,
    parentId: null,
    documentCount: documents.filter((d) => d.folderId === folder.value && !d.trashed).length,
  }));
}

function buildTree(): DocumentTreeNode[] {
  const folders: DocumentTreeNode[] = FOLDER_OPTIONS.map((folder) => {
    const docsInFolder = documents.filter(
      (d) => d.folderId === folder.value && !d.trashed && !d.parentId
    );
    return {
      id: folder.value,
      title: folder.label,
      parentId: null,
      folderId: folder.value,
      isFolder: true,
      icon: "🗂",
      documentCount: documents.filter((d) => d.folderId === folder.value && !d.trashed).length,
      children: docsInFolder.map((doc) => toTreeNode(doc)),
    };
  });
  return folders;
}

function toTreeNode(doc: Document): DocumentTreeNode {
  const children = documents
    .filter((d) => d.parentId === doc.id && !d.trashed)
    .map((child) => toTreeNode(child));
  return {
    id: doc.id,
    title: doc.title,
    parentId: doc.parentId,
    folderId: doc.folderId,
    icon: doc.icon,
    isFolder: false,
    children,
  };
}

function toDetail(doc: Document): DocumentDetail {
  const nodes = documents.map((d) => ({
    id: d.id,
    title: d.title,
    parentId: d.parentId,
  }));
  return {
    ...doc,
    permissions: [
      {
        id: "perm_owner",
        userId: doc.owner.id,
        userName: doc.owner.name,
        avatarUrl: doc.owner.avatarUrl,
        role: "owner",
      },
      {
        id: "perm_editor",
        userId: "user_leo",
        userName: "Leo Martins",
        role: "editor",
      },
      {
        id: "perm_viewer",
        userId: "user_noah",
        userName: "Noah Kim",
        role: "viewer",
      },
    ],
    analytics: {
      views: 120 + doc.version * 17,
      comments: doc.id === "doc_architecture" ? 3 : 1,
      versions: versionsByDoc[doc.id]?.length ?? doc.version,
      editors: 2,
      readingTimeMinutes: doc.readingTimeMinutes,
      lastUpdated: doc.updatedAt,
    },
    activity: [
      {
        id: `act_${doc.id}_1`,
        actorName: doc.owner.name,
        summary: `Updated “${doc.title}”`,
        timestamp: doc.updatedAt,
      },
      {
        id: `act_${doc.id}_2`,
        actorName: "Leo Martins",
        summary: "Commented on this document",
        timestamp: "2026-08-03T09:00:00.000Z",
      },
    ],
    breadcrumb: buildBreadcrumb(nodes, doc.id),
  };
}

function nextId() {
  return `doc_${Math.random().toString(36).slice(2, 10)}`;
}

export const documentService = {
  async list(params: {
    filters: DocumentFilters;
    sort: DocumentSortField;
  }): Promise<DocumentListResult> {
    await delay();
    const items = sortDocuments(
      documents.filter((d) => matchesFilters(d, params.filters) && !d.archived),
      params.sort
    );
    return {
      items,
      total: items.length,
      folders: buildFolders(),
      tree: buildTree(),
    };
  },

  async getById(id: string): Promise<DocumentDetail> {
    await delay(200);
    const doc = documents.find((d) => d.id === id);
    if (!doc) throw new DocumentNotFoundError();
    doc.lastOpenedAt = new Date().toISOString();
    return toDetail(doc);
  },

  async create(payload: CreateDocumentPayload): Promise<DocumentDetail> {
    await delay(320);
    if (!payload.title?.trim()) {
      throw new DocumentValidationError("Title is required");
    }
    if (payload.parentId && !documents.some((d) => d.id === payload.parentId)) {
      throw new DocumentValidationError("Parent document was not found");
    }

    let contentHtml = payload.contentHtml ?? "<p></p>";
    let contentMarkdown = payload.contentMarkdown ?? "";
    if (payload.templateId) {
      const template = await templateService.getById(payload.templateId);
      if (template) {
        contentHtml = template.contentHtml;
        contentMarkdown = template.contentMarkdown;
      }
    }

    const now = new Date().toISOString();
    const doc: Document = {
      id: nextId(),
      title: payload.title.trim(),
      description: payload.description?.trim() ?? "",
      icon: payload.icon || "📄",
      coverImageUrl: payload.coverImageUrl || undefined,
      folderId: payload.folderId ?? null,
      folderName: folderName(payload.folderId),
      parentId: payload.parentId ?? null,
      tags: payload.tags ?? [],
      visibility: payload.visibility ?? "workspace",
      favorited: false,
      archived: false,
      trashed: false,
      shared: false,
      owner: { id: "user_ava", name: "Ava Chen" },
      contentHtml,
      contentMarkdown,
      wordCount: countWords(contentHtml || contentMarkdown),
      readingTimeMinutes: estimateReadingTimeMinutes(contentHtml || contentMarkdown),
      version: 1,
      templateId: payload.templateId ?? undefined,
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
    };
    documents = [doc, ...documents];
    versionsByDoc[doc.id] = [
      {
        id: `ver_${doc.id}_1`,
        documentId: doc.id,
        version: 1,
        authorId: doc.owner.id,
        authorName: doc.owner.name,
        summary: "Initial version",
        createdAt: now,
        contentHtml: doc.contentHtml,
        contentMarkdown: doc.contentMarkdown,
      },
    ];
    return toDetail(doc);
  },

  async update(id: string, payload: UpdateDocumentPayload): Promise<DocumentDetail> {
    await delay(280);
    const index = documents.findIndex((d) => d.id === id);
    if (index < 0) throw new DocumentNotFoundError();
    const current = documents[index]!;

    if (payload.parentId && payload.parentId === id) {
      throw new DocumentValidationError("A document cannot be its own parent");
    }
    if (payload.parentId && !documents.some((d) => d.id === payload.parentId)) {
      throw new DocumentValidationError("Parent document was not found");
    }

    const contentHtml = payload.contentHtml ?? current.contentHtml;
    const contentMarkdown = payload.contentMarkdown ?? current.contentMarkdown;
    const contentChanged =
      payload.contentHtml !== undefined || payload.contentMarkdown !== undefined;

    const updated: Document = {
      ...current,
      title: payload.title?.trim() ?? current.title,
      description: payload.description ?? current.description,
      folderId: payload.folderId === undefined ? current.folderId : payload.folderId,
      folderName:
        payload.folderId === undefined
          ? current.folderName
          : folderName(payload.folderId),
      parentId: payload.parentId === undefined ? current.parentId : payload.parentId,
      tags: payload.tags ?? current.tags,
      visibility: payload.visibility ?? current.visibility,
      icon: payload.icon ?? current.icon,
      coverImageUrl:
        payload.coverImageUrl === undefined ? current.coverImageUrl : payload.coverImageUrl,
      contentHtml,
      contentMarkdown,
      wordCount: countWords(contentHtml || contentMarkdown),
      readingTimeMinutes: estimateReadingTimeMinutes(contentHtml || contentMarkdown),
      favorited: payload.favorited ?? current.favorited,
      archived: payload.archived ?? current.archived,
      trashed: payload.trashed ?? current.trashed,
      version: contentChanged ? current.version + 1 : current.version,
      updatedAt: new Date().toISOString(),
    };

    documents[index] = updated;

    if (contentChanged) {
      const list = versionsByDoc[id] ?? [];
      versionsByDoc[id] = [
        {
          id: `ver_${id}_${updated.version}`,
          documentId: id,
          version: updated.version,
          authorId: updated.owner.id,
          authorName: updated.owner.name,
          summary: "Content updated",
          createdAt: updated.updatedAt,
          contentHtml: updated.contentHtml,
          contentMarkdown: updated.contentMarkdown,
        },
        ...list,
      ];
    }

    return toDetail(updated);
  },

  async delete(id: string): Promise<void> {
    await delay(220);
    const doc = documents.find((d) => d.id === id);
    if (!doc) throw new DocumentNotFoundError();
    doc.trashed = true;
    doc.updatedAt = new Date().toISOString();
  },

  async restore(id: string): Promise<DocumentDetail> {
    await delay(220);
    const doc = documents.find((d) => d.id === id);
    if (!doc) throw new DocumentNotFoundError();
    doc.trashed = false;
    doc.updatedAt = new Date().toISOString();
    return toDetail(doc);
  },

  async duplicate(id: string): Promise<DocumentDetail> {
    await delay(300);
    const doc = documents.find((d) => d.id === id);
    if (!doc) throw new DocumentNotFoundError();
    return this.create({
      title: `${doc.title} (Copy)`,
      description: doc.description,
      folderId: doc.folderId,
      parentId: doc.parentId,
      tags: doc.tags,
      visibility: doc.visibility,
      icon: doc.icon,
      contentHtml: doc.contentHtml,
      contentMarkdown: doc.contentMarkdown,
    });
  },

  async archive(id: string): Promise<DocumentDetail> {
    return this.update(id, { archived: true });
  },

  async toggleFavorite(id: string): Promise<DocumentDetail> {
    const doc = documents.find((d) => d.id === id);
    if (!doc) throw new DocumentNotFoundError();
    return this.update(id, { favorited: !doc.favorited });
  },

  async share(id: string, payload: ShareDocumentPayload): Promise<DocumentDetail> {
    await delay(240);
    const doc = documents.find((d) => d.id === id);
    if (!doc) throw new DocumentNotFoundError();
    doc.visibility = payload.visibility;
    doc.shared =
      payload.visibility !== "private" ||
      Boolean(payload.userIds?.length) ||
      Boolean(payload.publicLinkEnabled);
    doc.updatedAt = new Date().toISOString();
    return toDetail(doc);
  },

  async move(id: string, payload: MoveDocumentPayload): Promise<DocumentDetail> {
    return this.update(id, {
      folderId: payload.folderId,
      parentId: payload.parentId ?? null,
    });
  },

  async history(id: string): Promise<DocumentVersion[]> {
    await delay(200);
    if (!documents.some((d) => d.id === id)) throw new DocumentNotFoundError();
    return [...(versionsByDoc[id] ?? [])];
  },

  async restoreVersion(documentId: string, versionId: string): Promise<DocumentDetail> {
    await delay(300);
    const version = (versionsByDoc[documentId] ?? []).find((v) => v.id === versionId);
    if (!version) throw new DocumentNotFoundError("Version not found");
    return this.update(documentId, {
      contentHtml: version.contentHtml,
      contentMarkdown: version.contentMarkdown,
    });
  },

  async search(q: string): Promise<Document[]> {
    await delay(180);
    return this.list({
      filters: {
        q,
        folderId: null,
        tag: null,
        authorId: null,
        visibility: "all",
        favoritesOnly: false,
        updatedFrom: null,
        updatedTo: null,
        sharedOnly: false,
        trashOnly: false,
      },
      sort: "recently_updated",
    }).then((r) => r.items.slice(0, 12));
  },

  async favorites(): Promise<Document[]> {
    await delay(180);
    return documents.filter((d) => d.favorited && !d.trashed && !d.archived);
  },

  async recent(): Promise<Document[]> {
    await delay(180);
    return [...documents]
      .filter((d) => d.lastOpenedAt && !d.trashed && !d.archived)
      .sort((a, b) => (b.lastOpenedAt ?? "").localeCompare(a.lastOpenedAt ?? ""))
      .slice(0, 12);
  },

  async shared(): Promise<Document[]> {
    await delay(180);
    return documents.filter((d) => d.shared && !d.trashed && !d.archived);
  },

  async tree(): Promise<DocumentTreeNode[]> {
    await delay(160);
    return buildTree();
  },
};

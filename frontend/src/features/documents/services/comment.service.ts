import type {
  CreateDocumentCommentPayload,
  DocumentComment,
  UpdateDocumentCommentPayload,
} from "../types/document.types";
import { DocumentNotFoundError, DocumentValidationError } from "../utils/errors";

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const commentsByDoc: Record<string, DocumentComment[]> = {
  doc_architecture: [
    {
      id: "cmt_1",
      documentId: "doc_architecture",
      parentId: null,
      authorId: "user_leo",
      authorName: "Leo Martins",
      bodyHtml: "<p>Can we add a sequence diagram for auth flows?</p>",
      resolved: false,
      edited: false,
      createdAt: "2026-08-03T09:00:00.000Z",
      updatedAt: "2026-08-03T09:00:00.000Z",
      replies: [
        {
          id: "cmt_1_r1",
          documentId: "doc_architecture",
          parentId: "cmt_1",
          authorId: "user_ava",
          authorName: "Ava Chen",
          bodyHtml: "<p>Good idea — I’ll add one under Domains.</p>",
          resolved: false,
          edited: false,
          createdAt: "2026-08-03T10:00:00.000Z",
          updatedAt: "2026-08-03T10:00:00.000Z",
        },
      ],
    },
    {
      id: "cmt_2",
      documentId: "doc_architecture",
      parentId: null,
      authorId: "user_mia",
      authorName: "Mia Patel",
      bodyHtml: "<p>Linking this from the RFC.</p>",
      resolved: true,
      edited: false,
      createdAt: "2026-08-02T14:00:00.000Z",
      updatedAt: "2026-08-02T15:00:00.000Z",
      replies: [],
    },
  ],
  doc_rfc_docs: [
    {
      id: "cmt_3",
      documentId: "doc_rfc_docs",
      parentId: null,
      authorId: "user_noah",
      authorName: "Noah Kim",
      bodyHtml: "<p>Should templates live in a separate gallery route?</p>",
      resolved: false,
      edited: false,
      createdAt: "2026-08-04T11:00:00.000Z",
      updatedAt: "2026-08-04T11:00:00.000Z",
      replies: [],
    },
  ],
};

function nextId() {
  return `cmt_${Math.random().toString(36).slice(2, 10)}`;
}

export const commentService = {
  async list(documentId: string): Promise<DocumentComment[]> {
    await delay();
    return structuredClone(commentsByDoc[documentId] ?? []);
  },

  async create(
    documentId: string,
    payload: CreateDocumentCommentPayload
  ): Promise<DocumentComment> {
    await delay(240);
    if (!payload.bodyHtml?.trim()) {
      throw new DocumentValidationError("Comment cannot be empty");
    }

    const now = new Date().toISOString();
    const comment: DocumentComment = {
      id: nextId(),
      documentId,
      parentId: payload.parentId ?? null,
      authorId: "user_ava",
      authorName: "Ava Chen",
      bodyHtml: payload.bodyHtml,
      resolved: false,
      edited: false,
      createdAt: now,
      updatedAt: now,
      replies: [],
    };

    const list = commentsByDoc[documentId] ?? [];
    if (payload.parentId) {
      const parent = list.find((c) => c.id === payload.parentId);
      if (!parent) throw new DocumentNotFoundError("Parent comment not found");
      parent.replies = [...(parent.replies ?? []), comment];
    } else {
      commentsByDoc[documentId] = [comment, ...list];
    }

    return comment;
  },

  async update(
    documentId: string,
    commentId: string,
    payload: UpdateDocumentCommentPayload
  ): Promise<DocumentComment> {
    await delay(200);
    const list = commentsByDoc[documentId] ?? [];

    const updateInTree = (items: DocumentComment[]): DocumentComment | null => {
      for (const item of items) {
        if (item.id === commentId) {
          if (payload.bodyHtml !== undefined) {
            item.bodyHtml = payload.bodyHtml;
            item.edited = true;
          }
          if (payload.resolved !== undefined) {
            item.resolved = payload.resolved;
          }
          item.updatedAt = new Date().toISOString();
          return item;
        }
        const nested = updateInTree(item.replies ?? []);
        if (nested) return nested;
      }
      return null;
    };

    const updated = updateInTree(list);
    if (!updated) throw new DocumentNotFoundError("Comment not found");
    return structuredClone(updated);
  },

  async delete(documentId: string, commentId: string): Promise<void> {
    await delay(180);
    const list = commentsByDoc[documentId] ?? [];

    const remove = (items: DocumentComment[]): boolean => {
      const index = items.findIndex((c) => c.id === commentId);
      if (index >= 0) {
        items.splice(index, 1);
        return true;
      }
      return items.some((c) => remove(c.replies ?? []));
    };

    if (!remove(list)) throw new DocumentNotFoundError("Comment not found");
    commentsByDoc[documentId] = list;
  },
};

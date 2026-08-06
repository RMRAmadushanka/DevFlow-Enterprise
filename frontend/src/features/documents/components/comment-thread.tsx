"use client";

import * as React from "react";
import { Check, Pencil, Trash2 } from "lucide-react";

import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { UserAvatar } from "@/components/data-display/avatars";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";

import {
  useCreateDocumentComment,
  useDeleteDocumentComment,
  useUpdateDocumentComment,
} from "../hooks/use-documents";
import type { DocumentComment } from "../types/document.types";
import { CommentEditor } from "./comment-editor";

export interface CommentThreadProps {
  documentId: string;
  comment: DocumentComment;
  depth?: number;
}

function CommentThread({ documentId, comment, depth = 0 }: CommentThreadProps) {
  const updateComment = useUpdateDocumentComment(documentId);
  const deleteComment = useDeleteDocumentComment(documentId);
  const createComment = useCreateDocumentComment(documentId);
  const [editing, setEditing] = React.useState(false);
  const [replying, setReplying] = React.useState(false);

  return (
    <li
      className={depth > 0 ? "ml-8 border-l border-border pl-4" : undefined}
      data-slot="comment-thread"
    >
      <div className="flex gap-3 border-b border-border py-4 last:border-b-0">
        <UserAvatar
          user={{
            id: comment.authorId,
            name: comment.authorName,
            imageUrl: comment.authorAvatarUrl,
          }}
          size="sm"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">{comment.authorName}</span>
            <time className="text-xs text-muted-foreground" dateTime={comment.createdAt}>
              {formatRelativeTime(comment.createdAt)}
            </time>
            {comment.edited ? (
              <span className="text-xs text-muted-foreground">(edited)</span>
            ) : null}
            {comment.resolved ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <Check className="size-3" aria-hidden />
                Resolved
              </span>
            ) : null}
          </div>

          {editing ? (
            <CommentEditor
              value={comment.bodyHtml}
              submitLabel="Save"
              label="Edit comment"
              loading={updateComment.isPending}
              onCancel={() => setEditing(false)}
              onSubmit={async (bodyHtml) => {
                await updateComment.mutateAsync({ id: comment.id, payload: { bodyHtml } });
                setEditing(false);
              }}
            />
          ) : (
            <div
              className="prose prose-sm max-w-none text-sm text-foreground dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: comment.bodyHtml }}
            />
          )}

          {!editing ? (
            <div className="flex flex-wrap gap-1">
              <PermissionGuard permission="document.update">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Edit comment"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Delete comment"
                  onClick={() => void deleteComment.mutateAsync(comment.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
                {!comment.resolved ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void updateComment.mutateAsync({
                        id: comment.id,
                        payload: { resolved: true },
                      })
                    }
                  >
                    Resolve
                  </Button>
                ) : null}
                {depth === 0 ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setReplying((v) => !v)}
                  >
                    Reply
                  </Button>
                ) : null}
              </PermissionGuard>
            </div>
          ) : null}

          {replying ? (
            <CommentEditor
              submitLabel="Reply"
              label="Write a reply"
              loading={createComment.isPending}
              onCancel={() => setReplying(false)}
              onSubmit={async (bodyHtml) => {
                await createComment.mutateAsync({ bodyHtml, parentId: comment.id });
                setReplying(false);
              }}
            />
          ) : null}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 ? (
        <ul className="space-y-0">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              documentId={documentId}
              comment={reply}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export { CommentThread };

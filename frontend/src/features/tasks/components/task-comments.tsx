"use client";

import * as React from "react";
import { AtSign, Pencil, Smile, Trash2 } from "lucide-react";

import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { UserAvatar } from "@/components/data-display/avatars";
import { RichTextEditor } from "@/components/forms/rich-text";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";

import {
  useCreateComment,
  useDeleteComment,
  useTaskComments,
  useUpdateComment,
} from "../hooks/use-tasks";
import type { TaskComment } from "../types/comment.types";
import { CommentSkeleton } from "./task-skeleton";
import { TaskEmptyState } from "./task-empty-state";

export interface TaskCommentsProps {
  taskId: string;
}

function CommentItem({
  comment,
  taskId,
}: {
  comment: TaskComment;
  taskId: string;
}) {
  const updateComment = useUpdateComment(taskId);
  const deleteComment = useDeleteComment(taskId);
  const [editing, setEditing] = React.useState(false);
  const [body, setBody] = React.useState(comment.bodyHtml);

  async function handleSave() {
    await updateComment.mutateAsync({ id: comment.id, payload: { bodyHtml: body } });
    setEditing(false);
  }

  return (
    <li className="flex gap-3 border-b border-border py-4 last:border-b-0">
      <UserAvatar
        user={{
          id: comment.authorId,
          name: comment.authorName,
          imageUrl: comment.authorAvatarUrl,
        }}
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
        </div>
        {editing ? (
          <>
            <RichTextEditor value={body} onValueChange={setBody} label="Edit comment" />
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={() => void handleSave()}>
                Save
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div
            className="prose prose-sm max-w-none text-sm text-foreground dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: comment.bodyHtml }}
          />
        )}
        {!editing ? (
          <PermissionGuard permission="task.update">
            <div className="flex gap-1">
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
            </div>
          </PermissionGuard>
        ) : null}
      </div>
    </li>
  );
}

function TaskComments({ taskId }: TaskCommentsProps) {
  const { data: comments = [], isLoading } = useTaskComments(taskId);
  const createComment = useCreateComment(taskId);
  const [body, setBody] = React.useState("");

  async function handleSubmit() {
    const trimmed = body.replace(/<[^>]+>/g, "").trim();
    if (!trimmed) return;
    await createComment.mutateAsync({ bodyHtml: body });
    setBody("");
  }

  if (isLoading) return <CommentSkeleton />;

  return (
    <div className="space-y-4" data-slot="task-comments">
      <PermissionGuard permission="task.update">
        <div className="space-y-2">
          <RichTextEditor value={body} onValueChange={setBody} label="Add comment" minHeight={120} />
          <div className="flex items-center gap-2">
            <Button type="button" size="icon-sm" variant="ghost" aria-label="Mention (coming soon)">
              <AtSign className="size-4" />
            </Button>
            <Button type="button" size="icon-sm" variant="ghost" aria-label="Emoji (coming soon)">
              <Smile className="size-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              className="ml-auto"
              onClick={() => void handleSubmit()}
              disabled={createComment.isPending}
            >
              Post comment
            </Button>
          </div>
        </div>
      </PermissionGuard>

      {comments.length === 0 ? (
        <TaskEmptyState variant="no-comments" />
      ) : (
        <ul aria-label="Comments">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} taskId={taskId} />
          ))}
        </ul>
      )}
    </div>
  );
}

export { TaskComments };

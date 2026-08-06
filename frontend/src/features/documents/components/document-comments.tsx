"use client";

import {
  useCreateDocumentComment,
  useDocumentComments,
} from "../hooks/use-documents";
import { CommentEditor } from "./comment-editor";
import { CommentThread } from "./comment-thread";
import { DocumentEmptyState } from "./document-empty-state";
import { CommentSkeleton } from "./document-skeleton";

export interface DocumentCommentsProps {
  documentId: string;
}

function DocumentComments({ documentId }: DocumentCommentsProps) {
  const { data: comments = [], isLoading } = useDocumentComments(documentId);
  const createComment = useCreateDocumentComment(documentId);

  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Loading comments">
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" data-slot="document-comments">
      <CommentEditor
        label="Add a comment"
        submitLabel="Post comment"
        loading={createComment.isPending}
        onSubmit={async (bodyHtml) => {
          await createComment.mutateAsync({ bodyHtml });
        }}
      />

      {comments.length === 0 ? (
        <DocumentEmptyState variant="no-comments" />
      ) : (
        <ul className="divide-y divide-border" aria-label="Comments">
          {comments.map((comment) => (
            <CommentThread key={comment.id} documentId={documentId} comment={comment} />
          ))}
        </ul>
      )}
    </div>
  );
}

export { DocumentComments };

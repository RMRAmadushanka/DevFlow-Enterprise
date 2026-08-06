export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  bodyHtml: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  edited: boolean;
}

export interface CreateCommentPayload {
  taskId: string;
  bodyHtml: string;
  parentId?: string;
}

export interface UpdateCommentPayload {
  bodyHtml: string;
}

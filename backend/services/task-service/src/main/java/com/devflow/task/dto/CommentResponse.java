package com.devflow.task.dto;

import java.time.Instant;
import java.util.UUID;

public record CommentResponse(
        UUID id,
        UUID taskId,
        UUID authorId,
        String authorName,
        String authorAvatarUrl,
        String bodyHtml,
        Instant createdAt,
        Instant updatedAt,
        UUID parentId,
        boolean edited
) {
}

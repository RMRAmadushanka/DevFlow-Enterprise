package com.devflow.sprint.dto;

import java.time.Instant;
import java.util.UUID;

public record RetroCommentResponse(
        UUID id,
        UUID authorId,
        String authorName,
        String text,
        Instant createdAt
) {
}

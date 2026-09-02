package com.devflow.sprint.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * A single retrospective card. {@code columnType} is a flat field (one of WENT_WELL /
 * NEEDS_IMPROVEMENT / ACTION_ITEM) rather than nesting items under per-column buckets, so
 * consumers can group client-side however their board layout needs.
 */
public record RetroItemResponse(
        UUID id,
        String columnType,
        String text,
        UUID authorId,
        String authorName,
        Instant createdAt,
        int voteCount,
        boolean votedByCurrentUser
) {
}

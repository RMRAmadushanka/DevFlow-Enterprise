package com.devflow.project.dto;

import java.time.Instant;
import java.util.UUID;

public record ProjectFavoriteResponse(
        UUID id,
        UUID projectId,
        UUID userId,
        Instant createdAt
) {
}

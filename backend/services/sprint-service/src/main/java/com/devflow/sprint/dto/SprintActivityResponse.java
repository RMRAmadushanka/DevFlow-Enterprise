package com.devflow.sprint.dto;

import java.time.Instant;
import java.util.UUID;

public record SprintActivityResponse(
        UUID id,
        UUID actorId,
        String actorName,
        String type,
        String summary,
        Instant createdAt
) {
}

package com.devflow.project.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record ProjectActivityResponse(
        UUID id,
        UUID projectId,
        UUID actorUserId,
        String activityType,
        String description,
        Map<String, Object> metadata,
        Instant createdAt
) {
}

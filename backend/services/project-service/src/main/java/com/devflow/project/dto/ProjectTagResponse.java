package com.devflow.project.dto;

import java.time.Instant;
import java.util.UUID;

public record ProjectTagResponse(
        UUID id,
        UUID projectId,
        String name,
        String color,
        Instant createdAt,
        Instant updatedAt
) {
}

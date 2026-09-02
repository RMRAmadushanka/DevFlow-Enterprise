package com.devflow.sprint.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ReleaseResponse(
        UUID id,
        UUID projectId,
        UUID organizationId,
        String name,
        String version,
        String description,
        String status,
        LocalDate releaseDate,
        List<String> features,
        Instant createdAt,
        Instant updatedAt
) {
}

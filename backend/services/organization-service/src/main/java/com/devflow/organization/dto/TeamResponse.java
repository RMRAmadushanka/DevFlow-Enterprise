package com.devflow.organization.dto;

import java.time.Instant;
import java.util.UUID;

public record TeamResponse(
        UUID id,
        UUID organizationId,
        String name,
        String slug,
        String description,
        UUID createdBy,
        Instant createdAt,
        Instant updatedAt
) {
}

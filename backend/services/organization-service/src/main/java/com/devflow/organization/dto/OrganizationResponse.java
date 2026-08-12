package com.devflow.organization.dto;

import com.devflow.organization.enums.OrganizationStatus;

import java.time.Instant;
import java.util.UUID;

public record OrganizationResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String logoUrl,
        OrganizationStatus status,
        UUID createdBy,
        Instant createdAt,
        Instant updatedAt
) {
}

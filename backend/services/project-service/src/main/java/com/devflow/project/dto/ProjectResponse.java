package com.devflow.project.dto;

import com.devflow.project.entity.ProjectHealth;
import com.devflow.project.entity.ProjectStatus;
import com.devflow.project.entity.ProjectVisibility;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        UUID organizationId,
        String name,
        String slug,
        String description,
        @JsonProperty("key") String projectKey,
        String icon,
        ProjectStatus status,
        ProjectHealth health,
        ProjectVisibility visibility,
        UUID createdBy,
        Instant archivedAt,
        Long version,
        Instant createdAt,
        Instant updatedAt
) {
}

package com.devflow.project.dto;

import com.devflow.project.entity.ProjectHealth;
import com.devflow.project.entity.ProjectStatus;
import com.devflow.project.entity.ProjectVisibility;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProjectSummaryResponse(
        UUID id,
        UUID organizationId,
        String name,
        String slug,
        @JsonProperty("key") String projectKey,
        String icon,
        ProjectStatus status,
        ProjectHealth health,
        ProjectVisibility visibility,
        long memberCount,
        boolean favorite,
        List<ProjectTagResponse> tags,
        Instant createdAt,
        Instant updatedAt
) {
}

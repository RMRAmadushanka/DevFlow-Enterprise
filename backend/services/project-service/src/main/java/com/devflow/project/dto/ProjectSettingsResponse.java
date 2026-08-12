package com.devflow.project.dto;

import com.devflow.project.entity.ProjectView;
import com.devflow.project.entity.ProjectVisibility;

import java.time.Instant;
import java.util.UUID;

public record ProjectSettingsResponse(
        UUID id,
        UUID projectId,
        ProjectVisibility defaultVisibility,
        boolean allowMemberInvites,
        boolean allowGuestAccess,
        String timezone,
        ProjectView defaultProjectView,
        Long version,
        Instant createdAt,
        Instant updatedAt
) {
}

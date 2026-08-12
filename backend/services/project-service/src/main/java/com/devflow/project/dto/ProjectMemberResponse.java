package com.devflow.project.dto;

import com.devflow.project.entity.MemberStatus;
import com.devflow.project.entity.ProjectRole;

import java.time.Instant;
import java.util.UUID;

public record ProjectMemberResponse(
        UUID id,
        UUID projectId,
        UUID userId,
        ProjectRole role,
        MemberStatus status,
        Instant joinedAt,
        Instant createdAt,
        Instant updatedAt
) {
}

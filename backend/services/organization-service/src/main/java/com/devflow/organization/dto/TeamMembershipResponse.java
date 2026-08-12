package com.devflow.organization.dto;

import com.devflow.organization.enums.TeamRole;

import java.time.Instant;
import java.util.UUID;

public record TeamMembershipResponse(
        UUID id,
        UUID teamId,
        UUID userId,
        TeamRole role,
        Instant joinedAt,
        Instant createdAt,
        Instant updatedAt
) {
}

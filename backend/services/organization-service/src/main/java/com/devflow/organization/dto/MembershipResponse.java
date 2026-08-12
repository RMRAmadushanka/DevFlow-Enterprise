package com.devflow.organization.dto;

import com.devflow.organization.enums.MembershipStatus;

import java.time.Instant;
import java.util.UUID;

public record MembershipResponse(
        UUID id,
        UUID organizationId,
        UUID userId,
        String roleCode,
        MembershipStatus status,
        Instant joinedAt,
        Instant createdAt,
        Instant updatedAt
) {
}

package com.devflow.organization.dto;

import com.devflow.organization.enums.InvitationStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record InvitationResponse(
        UUID id,
        UUID organizationId,
        String email,
        String roleCode,
        InvitationStatus status,
        Instant expiresAt,
        UUID invitedBy,
        Instant createdAt,
        Instant acceptedAt,
        String token
) {
}

package com.devflow.organization.dto;

import java.util.UUID;

/**
 * Lightweight projection for user-service Feign integration.
 */
public record OrganizationSummaryResponse(
        UUID id,
        String name,
        String slug,
        String role
) {
}

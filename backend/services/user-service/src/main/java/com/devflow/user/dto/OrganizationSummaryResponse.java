package com.devflow.user.dto;

import java.util.UUID;

/**
 * Lightweight org projection returned via organization-service Feign client.
 */
public record OrganizationSummaryResponse(
        UUID id,
        String name,
        String slug,
        String role
) {
}

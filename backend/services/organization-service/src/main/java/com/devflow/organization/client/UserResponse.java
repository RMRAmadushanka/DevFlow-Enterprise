package com.devflow.organization.client;

import java.util.UUID;

/**
 * Minimal user-service projection for Feign clients.
 */
public record UserResponse(
        UUID id,
        String externalIdentityId,
        String email,
        String username,
        String firstName,
        String lastName,
        String displayName,
        String status
) {
}

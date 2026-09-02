package com.devflow.analytics.security;

import com.devflow.common.exception.UnauthorizedException;
import com.devflow.common.security.SecurityContextUtils;

import java.util.UUID;

/**
 * Service-local facade over shared security helpers.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static String currentUserId() {
        return SecurityContextUtils.currentUserId().orElse(null);
    }

    /**
     * JWT subject as a UUID, required. Matches sprint-service's SecurityUtils.requireCurrentUserId():
     * the JWT subject is treated as the application user id directly (no user-service lookup).
     */
    public static UUID requireCurrentUserId() {
        String raw = currentUserId();
        if (raw == null || raw.isBlank()) {
            throw new UnauthorizedException("Authentication required");
        }
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException ex) {
            throw new UnauthorizedException("Authentication required");
        }
    }
}

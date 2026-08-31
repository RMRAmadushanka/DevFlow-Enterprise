package com.devflow.sprint.security;

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

    public static String currentUsername() {
        return SecurityContextUtils.currentUsername().orElse(null);
    }

    /**
     * JWT subject as a UUID, required. Sprint-service treats the JWT subject as the application
     * user id directly (no user-service lookup, unlike project-service's CurrentUserResolver).
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

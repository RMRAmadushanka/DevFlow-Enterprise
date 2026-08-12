package com.devflow.project.security;

import com.devflow.common.security.SecurityContextUtils;

/**
 * Service-local facade over shared security helpers.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static String currentUserId() {
        return SecurityContextUtils.currentUserId().orElse(null);
    }
}

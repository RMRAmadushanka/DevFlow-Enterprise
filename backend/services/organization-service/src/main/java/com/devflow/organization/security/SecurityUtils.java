package com.devflow.organization.security;

import com.devflow.common.security.SecurityContextUtils;

import java.util.List;

/**
 * Service-local facade over shared security helpers.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static String currentExternalIdentityId() {
        return SecurityContextUtils.currentUserId().orElse(null);
    }

    public static String currentEmail() {
        return SecurityContextUtils.currentEmail().orElse(null);
    }

    public static List<String> currentRoles() {
        return SecurityContextUtils.currentRoles();
    }
}

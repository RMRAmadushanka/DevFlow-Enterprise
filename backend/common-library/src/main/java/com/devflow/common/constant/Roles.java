package com.devflow.common.constant;

/**
 * Keycloak realm roles used by DevFlow.
 * Keep in sync with infrastructure/keycloak/realm-devflow.json.
 */
public final class Roles {

    /** Default authenticated identity role (Keycloak). */
    public static final String USER = "USER";
    /** Platform administrator identity role (Keycloak). */
    public static final String PLATFORM_ADMIN = "PLATFORM_ADMIN";
    public static final String SUPER_ADMIN = "SUPER_ADMIN";
    public static final String ADMIN = "ADMIN";
    public static final String MANAGER = "MANAGER";
    public static final String DEVELOPER = "DEVELOPER";
    public static final String QA = "QA";
    public static final String VIEWER = "VIEWER";
    public static final String GUEST = "GUEST";

    public static final String ROLE_PREFIX = "ROLE_";

    private Roles() {
    }

    public static String asAuthority(String role) {
        if (role == null || role.isBlank()) {
            return role;
        }
        return role.startsWith(ROLE_PREFIX) ? role : ROLE_PREFIX + role;
    }

    /** True for platform-level administrators (Keycloak identity roles). */
    public static boolean isPlatformAdminRole(String role) {
        if (role == null || role.isBlank()) {
            return false;
        }
        String normalized = role.startsWith(ROLE_PREFIX) ? role.substring(ROLE_PREFIX.length()) : role;
        return PLATFORM_ADMIN.equalsIgnoreCase(normalized)
                || SUPER_ADMIN.equalsIgnoreCase(normalized)
                || ADMIN.equalsIgnoreCase(normalized);
    }
}

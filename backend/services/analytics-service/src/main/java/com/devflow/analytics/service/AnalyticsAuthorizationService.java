package com.devflow.analytics.service;

import com.devflow.analytics.client.OrgPermissionResponse;
import com.devflow.analytics.client.OrganizationClient;
import com.devflow.analytics.client.UserClient;
import com.devflow.analytics.client.UserResponse;
import com.devflow.analytics.exception.AnalyticsAccessDeniedException;
import com.devflow.common.api.ApiResponse;
import com.devflow.common.constant.Roles;
import com.devflow.common.security.SecurityContextUtils;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * analytics-service RBAC: this service is read-only and conceptually an extension of sprint
 * reporting, so it reuses the sprint.read permission rather than inventing analytics.read.
 * Same shape as sprint-service's SprintAuthorizationService: resolve org-level permission codes
 * via Feign, treat any Feign failure/404/403 as "no permission", platform-admin roles bypass.
 */
@Service
public class AnalyticsAuthorizationService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsAuthorizationService.class);

    public static final String PERM_READ = "sprint.read";

    private final OrganizationClient organizationClient;
    private final UserClient userClient;

    public AnalyticsAuthorizationService(OrganizationClient organizationClient, UserClient userClient) {
        this.organizationClient = organizationClient;
        this.userClient = userClient;
    }

    public void requireRead(UUID organizationId, UUID actorId) {
        if (!has(organizationId, actorId, PERM_READ)) {
            throw new AnalyticsAccessDeniedException("Missing permission: " + PERM_READ);
        }
    }

    private boolean has(UUID organizationId, UUID userId, String permission) {
        if (isPlatformAdmin()) {
            return true;
        }
        if (organizationId == null) {
            log.warn("permission={} result=denied reason=missing_organization_id", permission);
            return false;
        }
        UUID applicationUserId = resolveApplicationUserId(userId);
        return orgPermissionCodes(organizationId, applicationUserId).contains(permission);
    }

    /**
     * Organization memberships (and therefore org-permission lookups) are keyed by user-service's
     * internal application user id, not the raw JWT subject — see {@link UserResponse}. Mirrors
     * organization-service's own {@code CurrentUserResolver}: try by-external-id first, fall back
     * to {@code /me}, and fall back to the raw subject only if user-service is unreachable so a
     * transient outage denies access instead of throwing.
     */
    private UUID resolveApplicationUserId(UUID jwtSubjectId) {
        try {
            ApiResponse<UserResponse> response = userClient.getByExternalId(jwtSubjectId.toString());
            if (response != null && response.success() && response.data() != null) {
                return response.data().id();
            }
        } catch (Exception ex) {
            log.debug("user_resolution_by_external_id_failed subject={} reason={}", jwtSubjectId, ex.getMessage());
        }
        try {
            ApiResponse<UserResponse> me = userClient.getMe();
            if (me != null && me.success() && me.data() != null) {
                return me.data().id();
            }
        } catch (Exception ex) {
            log.warn("user_resolution_failed subject={} reason={}", jwtSubjectId, ex.getMessage());
        }
        return jwtSubjectId;
    }

    private Set<String> orgPermissionCodes(UUID organizationId, UUID userId) {
        try {
            ApiResponse<java.util.List<OrgPermissionResponse>> response =
                    organizationClient.memberPermissions(organizationId, userId);
            if (response == null || !response.success() || response.data() == null) {
                return Collections.emptySet();
            }
            return response.data().stream()
                    .map(OrgPermissionResponse::code)
                    .collect(Collectors.toSet());
        } catch (FeignException.NotFound | FeignException.Forbidden ex) {
            log.debug("org_permission_lookup_denied organizationId={} userId={} status={}", organizationId, userId, ex.status());
            return Collections.emptySet();
        } catch (FeignException ex) {
            log.warn("org_permission_lookup_failed organizationId={} userId={} status={}", organizationId, userId, ex.status());
            return Collections.emptySet();
        }
    }

    private boolean isPlatformAdmin() {
        return SecurityContextUtils.hasRole(Roles.PLATFORM_ADMIN)
                || SecurityContextUtils.hasRole(Roles.SUPER_ADMIN)
                || SecurityContextUtils.hasRole(Roles.ADMIN);
    }
}

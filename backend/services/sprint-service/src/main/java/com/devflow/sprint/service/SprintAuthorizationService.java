package com.devflow.sprint.service;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.constant.Roles;
import com.devflow.common.security.SecurityContextUtils;
import com.devflow.sprint.client.OrgPermissionResponse;
import com.devflow.sprint.client.OrganizationClient;
import com.devflow.sprint.client.UserClient;
import com.devflow.sprint.client.UserResponse;
import com.devflow.sprint.entity.Sprint;
import com.devflow.sprint.exception.SprintAccessDeniedException;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Sprint RBAC: sprint-service has no local membership/role table (unlike project-service's
 * ProjectMember), so permission resolution is purely "does the org-level permission set for this
 * user contain the required sprint.* code", resolved via {@link OrganizationClient}.
 */
@Service
public class SprintAuthorizationService {

    private static final Logger log = LoggerFactory.getLogger(SprintAuthorizationService.class);

    public static final String PERM_CREATE = "sprint.create";
    public static final String PERM_READ = "sprint.read";
    public static final String PERM_UPDATE = "sprint.update";
    public static final String PERM_DELETE = "sprint.delete";
    public static final String PERM_START = "sprint.start";
    public static final String PERM_COMPLETE = "sprint.complete";
    public static final String PERM_MANAGE_BACKLOG = "sprint.manage_backlog";

    private final OrganizationClient organizationClient;
    private final UserClient userClient;

    public SprintAuthorizationService(OrganizationClient organizationClient, UserClient userClient) {
        this.organizationClient = organizationClient;
        this.userClient = userClient;
    }

    public void requireCreate(UUID organizationId, UUID userId) {
        require(has(organizationId, userId, PERM_CREATE), PERM_CREATE);
    }

    public void requireRead(Sprint sprint, UUID userId) {
        require(has(sprint.getOrganizationId(), userId, PERM_READ), PERM_READ);
    }

    /**
     * Organization-scoped overload for aggregates that aren't owned by a specific {@link Sprint}
     * (e.g. {@code Release}), so callers don't need a throwaway Sprint just to reuse this check.
     */
    public void requireRead(UUID organizationId, UUID userId) {
        require(has(organizationId, userId, PERM_READ), PERM_READ);
    }

    public void requireUpdate(Sprint sprint, UUID userId) {
        require(has(sprint.getOrganizationId(), userId, PERM_UPDATE), PERM_UPDATE);
    }

    /** Organization-scoped overload — see {@link #requireRead(UUID, UUID)}. */
    public void requireUpdate(UUID organizationId, UUID userId) {
        require(has(organizationId, userId, PERM_UPDATE), PERM_UPDATE);
    }

    public void requireDelete(Sprint sprint, UUID userId) {
        require(has(sprint.getOrganizationId(), userId, PERM_DELETE), PERM_DELETE);
    }

    /** Organization-scoped overload — see {@link #requireRead(UUID, UUID)}. */
    public void requireDelete(UUID organizationId, UUID userId) {
        require(has(organizationId, userId, PERM_DELETE), PERM_DELETE);
    }

    public void requireStart(Sprint sprint, UUID userId) {
        require(has(sprint.getOrganizationId(), userId, PERM_START), PERM_START);
    }

    public void requireComplete(Sprint sprint, UUID userId) {
        require(has(sprint.getOrganizationId(), userId, PERM_COMPLETE), PERM_COMPLETE);
    }

    public void requireManageBacklog(Sprint sprint, UUID userId) {
        require(has(sprint.getOrganizationId(), userId, PERM_MANAGE_BACKLOG), PERM_MANAGE_BACKLOG);
    }

    private boolean has(UUID organizationId, UUID userId, String permission) {
        if (isPlatformAdmin()) {
            return true;
        }
        if (organizationId == null) {
            log.warn("permission={} result=denied reason=sprint_missing_organization_id", permission);
            return false;
        }
        UUID applicationUserId = resolveApplicationUserId(userId);
        return orgPermissionCodes(organizationId, applicationUserId).contains(permission);
    }

    /**
     * Organization memberships (and therefore org-permission lookups) are keyed by user-service's
     * internal application user id, not the raw JWT subject — see {@link UserResponse}. Mirrors
     * organization-service's own {@code CurrentUserResolver}: try by-external-id first, fall back
     * to {@code /me} (which lazily provisions the caller if this is their first authenticated
     * request), and fall back to the raw subject only if user-service is unreachable so a
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

    private void require(boolean allowed, String permission) {
        if (!allowed) {
            throw new SprintAccessDeniedException("Missing permission: " + permission);
        }
    }

    public Set<String> orgPermissionCodes(UUID organizationId, UUID userId) {
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

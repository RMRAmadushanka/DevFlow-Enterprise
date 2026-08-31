package com.devflow.sprint.service;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.constant.Roles;
import com.devflow.common.security.SecurityContextUtils;
import com.devflow.sprint.client.OrgPermissionResponse;
import com.devflow.sprint.client.OrganizationClient;
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

    public SprintAuthorizationService(OrganizationClient organizationClient) {
        this.organizationClient = organizationClient;
    }

    public void requireCreate(UUID organizationId, UUID userId) {
        require(has(organizationId, userId, PERM_CREATE), PERM_CREATE);
    }

    public void requireRead(Sprint sprint, UUID userId) {
        require(has(sprint.getOrganizationId(), userId, PERM_READ), PERM_READ);
    }

    public void requireUpdate(Sprint sprint, UUID userId) {
        require(has(sprint.getOrganizationId(), userId, PERM_UPDATE), PERM_UPDATE);
    }

    public void requireDelete(Sprint sprint, UUID userId) {
        require(has(sprint.getOrganizationId(), userId, PERM_DELETE), PERM_DELETE);
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
        return orgPermissionCodes(organizationId, userId).contains(permission);
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
            return Collections.emptySet();
        } catch (FeignException ex) {
            return Collections.emptySet();
        }
    }

    private boolean isPlatformAdmin() {
        return SecurityContextUtils.hasRole(Roles.PLATFORM_ADMIN)
                || SecurityContextUtils.hasRole(Roles.SUPER_ADMIN)
                || SecurityContextUtils.hasRole(Roles.ADMIN);
    }
}

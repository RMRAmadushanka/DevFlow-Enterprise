package com.devflow.organization.service;

import com.devflow.common.constant.Roles;
import com.devflow.common.exception.ForbiddenException;
import com.devflow.common.security.SecurityContextUtils;
import com.devflow.organization.repository.OrganizationMembershipRepository;
import com.devflow.organization.repository.OrganizationRolePermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Set;
import java.util.UUID;

@Service
public class OrganizationAuthorizationService {

    public static final String PERM_ORG_READ = "organization.read";
    public static final String PERM_ORG_UPDATE = "organization.update";
    public static final String PERM_ORG_DELETE = "organization.delete";
    public static final String PERM_ORG_MANAGE_MEMBERS = "organization.manage_members";
    public static final String PERM_TEAM_CREATE = "team.create";
    public static final String PERM_TEAM_READ = "team.read";
    public static final String PERM_TEAM_UPDATE = "team.update";
    public static final String PERM_TEAM_DELETE = "team.delete";
    public static final String PERM_TEAM_MANAGE_MEMBERS = "team.manage_members";
    public static final String PERM_PROJECT_CREATE = "project.create";
    public static final String PERM_PROJECT_READ = "project.read";
    public static final String PERM_PROJECT_UPDATE = "project.update";
    public static final String PERM_PROJECT_DELETE = "project.delete";
    public static final String PERM_TASK_CREATE = "task.create";
    public static final String PERM_TASK_READ = "task.read";
    public static final String PERM_TASK_UPDATE = "task.update";
    public static final String PERM_TASK_DELETE = "task.delete";
    public static final String PERM_SPRINT_CREATE = "sprint.create";
    public static final String PERM_SPRINT_READ = "sprint.read";
    public static final String PERM_SPRINT_UPDATE = "sprint.update";
    public static final String PERM_SPRINT_DELETE = "sprint.delete";
    public static final String PERM_ROLE_MANAGE = "role.manage";

    private final OrganizationMembershipRepository membershipRepository;
    private final OrganizationRolePermissionRepository organizationRolePermissionRepository;

    public OrganizationAuthorizationService(
            OrganizationMembershipRepository membershipRepository,
            OrganizationRolePermissionRepository organizationRolePermissionRepository
    ) {
        this.membershipRepository = membershipRepository;
        this.organizationRolePermissionRepository = organizationRolePermissionRepository;
    }

    @Transactional(readOnly = true)
    public Set<String> permissionCodes(UUID organizationId, UUID userId) {
        if (isPlatformAdmin()) {
            return Set.of(
                    PERM_ORG_READ, PERM_ORG_UPDATE, PERM_ORG_DELETE, PERM_ORG_MANAGE_MEMBERS,
                    PERM_TEAM_CREATE, PERM_TEAM_READ, PERM_TEAM_UPDATE, PERM_TEAM_DELETE, PERM_TEAM_MANAGE_MEMBERS,
                    PERM_PROJECT_CREATE, PERM_PROJECT_READ, PERM_PROJECT_UPDATE, PERM_PROJECT_DELETE,
                    PERM_TASK_CREATE, PERM_TASK_READ, PERM_TASK_UPDATE, PERM_TASK_DELETE,
                    PERM_SPRINT_CREATE, PERM_SPRINT_READ, PERM_SPRINT_UPDATE, PERM_SPRINT_DELETE,
                    PERM_ROLE_MANAGE
            );
        }
        Set<String> codes = organizationRolePermissionRepository.existsByOrganizationId(organizationId)
                ? organizationRolePermissionRepository.findPermissionCodes(organizationId, userId)
                : membershipRepository.findPermissionCodes(organizationId, userId);
        return codes == null ? Collections.emptySet() : codes;
    }

    @Transactional(readOnly = true)
    public boolean canReadOrganization(UUID organizationId, UUID userId) {
        return hasPermission(organizationId, userId, PERM_ORG_READ);
    }

    @Transactional(readOnly = true)
    public boolean canUpdateOrganization(UUID organizationId, UUID userId) {
        return hasPermission(organizationId, userId, PERM_ORG_UPDATE);
    }

    @Transactional(readOnly = true)
    public boolean canDeleteOrganization(UUID organizationId, UUID userId) {
        return hasPermission(organizationId, userId, PERM_ORG_DELETE);
    }

    @Transactional(readOnly = true)
    public boolean canManageMembers(UUID organizationId, UUID userId) {
        return hasPermission(organizationId, userId, PERM_ORG_MANAGE_MEMBERS);
    }

    @Transactional(readOnly = true)
    public boolean canManageTeams(UUID organizationId, UUID userId) {
        Set<String> perms = permissionCodes(organizationId, userId);
        return perms.contains(PERM_TEAM_CREATE) || perms.contains(PERM_TEAM_MANAGE_MEMBERS);
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(UUID organizationId, UUID userId, String permissionCode) {
        return permissionCodes(organizationId, userId).contains(permissionCode);
    }

    public void require(boolean allowed, String message) {
        if (!allowed) {
            throw new ForbiddenException(message);
        }
    }

    @Transactional(readOnly = true)
    public void requireRead(UUID organizationId, UUID userId) {
        require(canReadOrganization(organizationId, userId), "Not allowed to read organization");
    }

    @Transactional(readOnly = true)
    public void requireUpdate(UUID organizationId, UUID userId) {
        require(canUpdateOrganization(organizationId, userId), "Not allowed to update organization");
    }

    @Transactional(readOnly = true)
    public void requireDelete(UUID organizationId, UUID userId) {
        require(canDeleteOrganization(organizationId, userId), "Not allowed to delete organization");
    }

    @Transactional(readOnly = true)
    public void requireManageMembers(UUID organizationId, UUID userId) {
        require(canManageMembers(organizationId, userId), "Not allowed to manage members");
    }

    @Transactional(readOnly = true)
    public boolean canManageRoles(UUID organizationId, UUID userId) {
        Set<String> perms = permissionCodes(organizationId, userId);
        return perms.contains(PERM_ROLE_MANAGE) || perms.contains(PERM_ORG_MANAGE_MEMBERS);
    }

    @Transactional(readOnly = true)
    public void requireManageRoles(UUID organizationId, UUID userId) {
        require(canManageRoles(organizationId, userId), "Not allowed to manage roles");
    }

    @Transactional(readOnly = true)
    public void requireManageTeams(UUID organizationId, UUID userId) {
        require(canManageTeams(organizationId, userId), "Not allowed to manage teams");
    }

    @Transactional(readOnly = true)
    public void requirePermission(UUID organizationId, UUID userId, String permissionCode) {
        require(hasPermission(organizationId, userId, permissionCode), "Missing permission: " + permissionCode);
    }

    public boolean isPlatformAdmin() {
        return SecurityContextUtils.hasRole(Roles.PLATFORM_ADMIN)
                || SecurityContextUtils.hasRole(Roles.SUPER_ADMIN)
                || SecurityContextUtils.hasRole(Roles.ADMIN);
    }
}
package com.devflow.project.service;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.constant.Roles;
import com.devflow.common.security.SecurityContextUtils;
import com.devflow.project.client.OrgPermissionResponse;
import com.devflow.project.client.OrganizationClient;
import com.devflow.project.entity.MemberStatus;
import com.devflow.project.entity.Project;
import com.devflow.project.entity.ProjectMember;
import com.devflow.project.entity.ProjectRole;
import com.devflow.project.entity.ProjectVisibility;
import com.devflow.project.exception.ProjectAccessDeniedException;
import com.devflow.project.repository.ProjectMemberRepository;
import feign.FeignException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Project RBAC: role → project.* permissions. Org-level project.create / project.read via Feign.
 * TEAM visibility is treated like PRIVATE in Phase 4 (members only).
 */
@Service
public class ProjectAuthorizationService {

    public static final String PERM_READ = "project.read";
    public static final String PERM_CREATE = "project.create";
    public static final String PERM_UPDATE = "project.update";
    public static final String PERM_DELETE = "project.delete";
    public static final String PERM_ARCHIVE = "project.archive";
    public static final String PERM_MANAGE_MEMBERS = "project.manage_members";
    public static final String PERM_MANAGE_SETTINGS = "project.manage_settings";
    public static final String PERM_MANAGE_TAGS = "project.manage_tags";
    public static final String PERM_VIEW_ACTIVITY = "project.view_activity";
    public static final String PERM_MANAGE_PROJECT = "project.manage_project";
    public static final String ORG_PERM_READ = "organization.read";

    private static final Map<ProjectRole, Set<String>> ROLE_PERMISSIONS = new EnumMap<>(ProjectRole.class);

    static {
        ROLE_PERMISSIONS.put(ProjectRole.PROJECT_OWNER, Set.of(
                PERM_READ, PERM_UPDATE, PERM_DELETE, PERM_ARCHIVE, PERM_MANAGE_MEMBERS,
                PERM_MANAGE_SETTINGS, PERM_MANAGE_TAGS, PERM_VIEW_ACTIVITY, PERM_MANAGE_PROJECT
        ));
        ROLE_PERMISSIONS.put(ProjectRole.PROJECT_ADMIN, Set.of(
                PERM_READ, PERM_UPDATE, PERM_ARCHIVE, PERM_MANAGE_MEMBERS,
                PERM_MANAGE_SETTINGS, PERM_MANAGE_TAGS, PERM_VIEW_ACTIVITY, PERM_MANAGE_PROJECT
        ));
        ROLE_PERMISSIONS.put(ProjectRole.PROJECT_MANAGER, Set.of(
                PERM_READ, PERM_UPDATE, PERM_MANAGE_MEMBERS, PERM_MANAGE_TAGS, PERM_VIEW_ACTIVITY
        ));
        ROLE_PERMISSIONS.put(ProjectRole.PROJECT_DEVELOPER, Set.of(PERM_READ, PERM_VIEW_ACTIVITY));
        ROLE_PERMISSIONS.put(ProjectRole.PROJECT_VIEWER, Set.of(PERM_READ, PERM_VIEW_ACTIVITY));
        ROLE_PERMISSIONS.put(ProjectRole.PROJECT_GUEST, Set.of(PERM_READ));
    }

    private final ProjectMemberRepository memberRepository;
    private final OrganizationClient organizationClient;

    public ProjectAuthorizationService(
            ProjectMemberRepository memberRepository,
            OrganizationClient organizationClient
    ) {
        this.memberRepository = memberRepository;
        this.organizationClient = organizationClient;
    }

    public Set<String> permissionsForRole(ProjectRole role) {
        return ROLE_PERMISSIONS.getOrDefault(role, Set.of());
    }

    @Transactional(readOnly = true)
    public Optional<ProjectMember> activeMembership(UUID projectId, UUID userId) {
        return memberRepository.findByProjectIdAndUserId(projectId, userId)
                .filter(m -> m.getStatus() == MemberStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public boolean canReadProject(Project project, UUID userId) {
        if (isPlatformAdmin()) {
            return true;
        }
        if (activeMembership(project.getId(), userId)
                .map(m -> permissionsForRole(m.getRole()).contains(PERM_READ))
                .orElse(false)) {
            return true;
        }
        // ORGANIZATION: org project.read (or organization.read for discovery)
        if (project.getVisibility() == ProjectVisibility.ORGANIZATION) {
            Set<String> orgPerms = orgPermissionCodes(project.getOrganizationId(), userId);
            return orgPerms.contains(PERM_READ) || orgPerms.contains(ORG_PERM_READ);
        }
        // PRIVATE and TEAM (Phase 4): members only
        return false;
    }

    /** @deprecated use {@link #canReadProject} — kept for call-site compatibility */
    @Transactional(readOnly = true)
    public boolean canRead(Project project, UUID userId) {
        return canReadProject(project, userId);
    }

    @Transactional(readOnly = true)
    public boolean canUpdateProject(Project project, UUID userId) {
        return hasProjectPermission(project, userId, PERM_UPDATE);
    }

    @Transactional(readOnly = true)
    public boolean canUpdate(Project project, UUID userId) {
        return canUpdateProject(project, userId);
    }

    @Transactional(readOnly = true)
    public boolean canDeleteProject(Project project, UUID userId) {
        return hasProjectPermission(project, userId, PERM_DELETE);
    }

    @Transactional(readOnly = true)
    public boolean canDelete(Project project, UUID userId) {
        return canDeleteProject(project, userId);
    }

    @Transactional(readOnly = true)
    public boolean canArchiveProject(Project project, UUID userId) {
        return hasProjectPermission(project, userId, PERM_ARCHIVE);
    }

    @Transactional(readOnly = true)
    public boolean canArchive(Project project, UUID userId) {
        return canArchiveProject(project, userId);
    }

    @Transactional(readOnly = true)
    public boolean canManageMembers(Project project, UUID userId) {
        return hasProjectPermission(project, userId, PERM_MANAGE_MEMBERS);
    }

    @Transactional(readOnly = true)
    public boolean canManageSettings(Project project, UUID userId) {
        return hasProjectPermission(project, userId, PERM_MANAGE_SETTINGS);
    }

    @Transactional(readOnly = true)
    public boolean canManageTags(Project project, UUID userId) {
        return hasProjectPermission(project, userId, PERM_MANAGE_TAGS);
    }

    @Transactional(readOnly = true)
    public boolean canViewActivity(Project project, UUID userId) {
        if (isPlatformAdmin()) {
            return true;
        }
        return activeMembership(project.getId(), userId)
                .map(m -> permissionsForRole(m.getRole()).contains(PERM_VIEW_ACTIVITY))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean canManageProject(Project project, UUID userId) {
        return hasProjectPermission(project, userId, PERM_MANAGE_PROJECT);
    }

    @Transactional(readOnly = true)
    public boolean hasProjectPermission(Project project, UUID userId, String permission) {
        if (isPlatformAdmin()) {
            return true;
        }
        return activeMembership(project.getId(), userId)
                .map(m -> permissionsForRole(m.getRole()).contains(permission))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean canCreateInOrganization(UUID organizationId, UUID userId) {
        if (isPlatformAdmin()) {
            return true;
        }
        return orgPermissionCodes(organizationId, userId).contains(PERM_CREATE);
    }

    public void requireRead(Project project, UUID userId) {
        require(canReadProject(project, userId), "Missing permission: " + PERM_READ);
    }

    public void requireUpdate(Project project, UUID userId) {
        require(canUpdateProject(project, userId), "Missing permission: " + PERM_UPDATE);
    }

    public void requireDelete(Project project, UUID userId) {
        require(canDeleteProject(project, userId), "Missing permission: " + PERM_DELETE);
    }

    public void requireArchive(Project project, UUID userId) {
        require(canArchiveProject(project, userId), "Missing permission: " + PERM_ARCHIVE);
    }

    public void requireManageProject(Project project, UUID userId) {
        require(canManageProject(project, userId), "Missing permission: " + PERM_MANAGE_PROJECT);
    }

    public void requireManageMembers(Project project, UUID userId) {
        require(canManageMembers(project, userId), "Missing permission: " + PERM_MANAGE_MEMBERS);
    }

    public void requireManageSettings(Project project, UUID userId) {
        require(canManageSettings(project, userId), "Missing permission: " + PERM_MANAGE_SETTINGS);
    }

    public void requireManageTags(Project project, UUID userId) {
        require(canManageTags(project, userId), "Missing permission: " + PERM_MANAGE_TAGS);
    }

    public void requireViewActivity(Project project, UUID userId) {
        require(canViewActivity(project, userId), "Missing permission: " + PERM_VIEW_ACTIVITY);
    }

    public void requireCreateInOrganization(UUID organizationId, UUID userId) {
        require(canCreateInOrganization(organizationId, userId), "Missing permission: " + PERM_CREATE);
    }

    public void require(boolean allowed, String message) {
        if (!allowed) {
            throw new ProjectAccessDeniedException(message);
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

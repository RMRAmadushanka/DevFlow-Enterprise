package com.devflow.project.service;

import com.devflow.common.api.ApiResponse;
import com.devflow.project.client.OrgPermissionResponse;
import com.devflow.project.client.OrganizationClient;
import com.devflow.project.entity.MemberStatus;
import com.devflow.project.entity.Project;
import com.devflow.project.entity.ProjectMember;
import com.devflow.project.entity.ProjectRole;
import com.devflow.project.entity.ProjectVisibility;
import com.devflow.project.repository.ProjectMemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectAuthorizationServiceTest {

    @Mock
    private ProjectMemberRepository memberRepository;
    @Mock
    private OrganizationClient organizationClient;

    @InjectMocks
    private ProjectAuthorizationService authorizationService;

    @Test
    void ownerHasAllPermissionsGuestOnlyRead() {
        UUID projectId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID guestId = UUID.randomUUID();

        Project project = privateProject(projectId);

        when(memberRepository.findByProjectIdAndUserId(projectId, ownerId))
                .thenReturn(Optional.of(member(ProjectRole.PROJECT_OWNER)));
        when(memberRepository.findByProjectIdAndUserId(projectId, guestId))
                .thenReturn(Optional.of(member(ProjectRole.PROJECT_GUEST)));

        assertThat(authorizationService.canReadProject(project, ownerId)).isTrue();
        assertThat(authorizationService.canUpdateProject(project, ownerId)).isTrue();
        assertThat(authorizationService.canDeleteProject(project, ownerId)).isTrue();
        assertThat(authorizationService.canArchiveProject(project, ownerId)).isTrue();
        assertThat(authorizationService.canManageMembers(project, ownerId)).isTrue();
        assertThat(authorizationService.canManageSettings(project, ownerId)).isTrue();
        assertThat(authorizationService.canManageTags(project, ownerId)).isTrue();
        assertThat(authorizationService.canViewActivity(project, ownerId)).isTrue();
        assertThat(authorizationService.canManageProject(project, ownerId)).isTrue();

        assertThat(authorizationService.canReadProject(project, guestId)).isTrue();
        assertThat(authorizationService.canUpdateProject(project, guestId)).isFalse();
        assertThat(authorizationService.canDeleteProject(project, guestId)).isFalse();
        assertThat(authorizationService.canArchiveProject(project, guestId)).isFalse();
        assertThat(authorizationService.canManageMembers(project, guestId)).isFalse();
        assertThat(authorizationService.canManageSettings(project, guestId)).isFalse();
        assertThat(authorizationService.canManageTags(project, guestId)).isFalse();
        assertThat(authorizationService.canViewActivity(project, guestId)).isFalse();
        assertThat(authorizationService.canManageProject(project, guestId)).isFalse();
    }

    @ParameterizedTest
    @EnumSource(ProjectRole.class)
    void everyRoleHasReadWhenActiveMember(ProjectRole role) {
        UUID projectId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Project project = privateProject(projectId);
        when(memberRepository.findByProjectIdAndUserId(projectId, userId))
                .thenReturn(Optional.of(member(role)));

        assertThat(authorizationService.canReadProject(project, userId)).isTrue();
    }

    @Test
    void adminCannotDeleteButCanManageProject() {
        UUID projectId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        Project project = privateProject(projectId);
        when(memberRepository.findByProjectIdAndUserId(projectId, adminId))
                .thenReturn(Optional.of(member(ProjectRole.PROJECT_ADMIN)));

        assertThat(authorizationService.canDeleteProject(project, adminId)).isFalse();
        assertThat(authorizationService.canArchiveProject(project, adminId)).isTrue();
        assertThat(authorizationService.canManageProject(project, adminId)).isTrue();
        assertThat(authorizationService.canManageSettings(project, adminId)).isTrue();
    }

    @Test
    void managerCanUpdateAndManageMembersButNotSettingsOrDelete() {
        UUID projectId = UUID.randomUUID();
        UUID managerId = UUID.randomUUID();
        Project project = privateProject(projectId);
        when(memberRepository.findByProjectIdAndUserId(projectId, managerId))
                .thenReturn(Optional.of(member(ProjectRole.PROJECT_MANAGER)));

        assertThat(authorizationService.canUpdateProject(project, managerId)).isTrue();
        assertThat(authorizationService.canManageMembers(project, managerId)).isTrue();
        assertThat(authorizationService.canManageTags(project, managerId)).isTrue();
        assertThat(authorizationService.canViewActivity(project, managerId)).isTrue();
        assertThat(authorizationService.canManageSettings(project, managerId)).isFalse();
        assertThat(authorizationService.canDeleteProject(project, managerId)).isFalse();
        assertThat(authorizationService.canArchiveProject(project, managerId)).isFalse();
        assertThat(authorizationService.canManageProject(project, managerId)).isFalse();
    }

    @Test
    void developerAndViewerCanReadAndViewActivityOnly() {
        UUID projectId = UUID.randomUUID();
        UUID developerId = UUID.randomUUID();
        UUID viewerId = UUID.randomUUID();
        Project project = privateProject(projectId);

        when(memberRepository.findByProjectIdAndUserId(projectId, developerId))
                .thenReturn(Optional.of(member(ProjectRole.PROJECT_DEVELOPER)));
        when(memberRepository.findByProjectIdAndUserId(projectId, viewerId))
                .thenReturn(Optional.of(member(ProjectRole.PROJECT_VIEWER)));

        for (UUID id : List.of(developerId, viewerId)) {
            assertThat(authorizationService.canReadProject(project, id)).isTrue();
            assertThat(authorizationService.canViewActivity(project, id)).isTrue();
            assertThat(authorizationService.canUpdateProject(project, id)).isFalse();
            assertThat(authorizationService.canManageMembers(project, id)).isFalse();
            assertThat(authorizationService.canManageTags(project, id)).isFalse();
        }
    }

    @Test
    void nonMemberCannotReadPrivateProject() {
        UUID projectId = UUID.randomUUID();
        UUID strangerId = UUID.randomUUID();
        Project project = privateProject(projectId);
        when(memberRepository.findByProjectIdAndUserId(projectId, strangerId)).thenReturn(Optional.empty());

        assertThat(authorizationService.canReadProject(project, strangerId)).isFalse();
    }

    @Test
    void organizationVisibilityAllowsOrgReadPermission() {
        UUID projectId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        UUID orgUserId = UUID.randomUUID();

        Project project = new Project();
        ReflectionTestUtils.setField(project, "id", projectId);
        project.setOrganizationId(orgId);
        project.setVisibility(ProjectVisibility.ORGANIZATION);

        when(memberRepository.findByProjectIdAndUserId(projectId, orgUserId)).thenReturn(Optional.empty());
        when(organizationClient.memberPermissions(orgId, orgUserId))
                .thenReturn(ApiResponse.ok(List.of(
                        new OrgPermissionResponse(UUID.randomUUID(), "project.read", "Read projects", "Read"))));

        assertThat(authorizationService.canReadProject(project, orgUserId)).isTrue();
        assertThat(authorizationService.canUpdateProject(project, orgUserId)).isFalse();
    }

    @Test
    void inactiveMemberDoesNotGrantPermissions() {
        UUID projectId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Project project = privateProject(projectId);

        ProjectMember inactive = member(ProjectRole.PROJECT_OWNER);
        inactive.setStatus(MemberStatus.INACTIVE);
        when(memberRepository.findByProjectIdAndUserId(projectId, userId)).thenReturn(Optional.of(inactive));

        assertThat(authorizationService.canReadProject(project, userId)).isFalse();
        assertThat(authorizationService.canManageProject(project, userId)).isFalse();
    }

    @Test
    void rolePermissionMatrixIncludesAdminWithoutDelete() {
        assertThat(authorizationService.permissionsForRole(ProjectRole.PROJECT_ADMIN))
                .contains(
                        ProjectAuthorizationService.PERM_READ,
                        ProjectAuthorizationService.PERM_UPDATE,
                        ProjectAuthorizationService.PERM_ARCHIVE,
                        ProjectAuthorizationService.PERM_MANAGE_MEMBERS,
                        ProjectAuthorizationService.PERM_MANAGE_PROJECT
                )
                .doesNotContain(ProjectAuthorizationService.PERM_DELETE);
    }

    private static Project privateProject(UUID projectId) {
        Project project = new Project();
        ReflectionTestUtils.setField(project, "id", projectId);
        project.setVisibility(ProjectVisibility.PRIVATE);
        project.setOrganizationId(UUID.randomUUID());
        return project;
    }

    private static ProjectMember member(ProjectRole role) {
        ProjectMember m = new ProjectMember();
        m.setRole(role);
        m.setStatus(MemberStatus.ACTIVE);
        return m;
    }
}

package com.devflow.project.service;

import com.devflow.project.client.UserClient;
import com.devflow.project.dto.CreateProjectRequest;
import com.devflow.project.dto.UpdateProjectHealthRequest;
import com.devflow.project.dto.UpdateProjectStatusRequest;
import com.devflow.project.entity.MemberStatus;
import com.devflow.project.entity.Project;
import com.devflow.project.entity.ProjectHealth;
import com.devflow.project.entity.ProjectMember;
import com.devflow.project.entity.ProjectRole;
import com.devflow.project.entity.ProjectSettings;
import com.devflow.project.entity.ProjectStatus;
import com.devflow.project.entity.ProjectVisibility;
import com.devflow.project.events.ProjectEventPublisher;
import com.devflow.project.events.ProjectEventType;
import com.devflow.project.exception.DuplicateProjectException;
import com.devflow.project.exception.InvalidProjectStatusException;
import com.devflow.project.mapper.ProjectMapper;
import com.devflow.project.repository.ProjectFavoriteRepository;
import com.devflow.project.repository.ProjectMemberRepository;
import com.devflow.project.repository.ProjectRepository;
import com.devflow.project.repository.ProjectSettingsRepository;
import com.devflow.project.repository.ProjectTagRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock private ProjectRepository projectRepository;
    @Mock private ProjectMemberRepository memberRepository;
    @Mock private ProjectSettingsRepository settingsRepository;
    @Mock private ProjectTagRepository tagRepository;
    @Mock private ProjectFavoriteRepository favoriteRepository;
    @Mock private ProjectMapper projectMapper;
    @Mock private ProjectAuthorizationService authorizationService;
    @Mock private ProjectEventPublisher eventPublisher;
    @Mock private ProjectActivityService activityService;
    @Mock private CurrentUserResolver currentUserResolver;
    @Mock private SlugService slugService;
    @Mock private UserClient userClient;

    @InjectMocks
    private ProjectService projectService;

    private UUID userId;
    private UUID orgId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        orgId = UUID.randomUUID();
    }

    @Test
    void createCreatesOwnerMembershipAndDefaultSettings() {
        when(currentUserResolver.requireCurrentUserId()).thenReturn(userId);
        doNothing().when(authorizationService).requireCreateInOrganization(orgId, userId);
        when(projectRepository.existsByOrganizationIdAndProjectKeyIgnoreCase(orgId, "ACME")).thenReturn(false);
        when(slugService.uniqueSlug(orgId, "Acme Project")).thenReturn("acme-project");

        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project p = invocation.getArgument(0);
            ReflectionTestUtils.setField(p, "id", UUID.randomUUID());
            return p;
        });
        when(memberRepository.save(any(ProjectMember.class))).thenAnswer(inv -> inv.getArgument(0));
        when(settingsRepository.save(any(ProjectSettings.class))).thenAnswer(inv -> inv.getArgument(0));
        when(projectMapper.toResponse(any(Project.class))).thenAnswer(inv -> {
            Project p = inv.getArgument(0);
            return new com.devflow.project.dto.ProjectResponse(
                    p.getId(), p.getOrganizationId(), p.getName(), p.getSlug(), p.getDescription(),
                    p.getProjectKey(), p.getIcon(), p.getStatus(), p.getHealth(), p.getVisibility(),
                    p.getCreatedBy(), p.getArchivedAt(), p.getVersion(), p.getCreatedAt(), p.getUpdatedAt()
            );
        });

        CreateProjectRequest request = new CreateProjectRequest(
                orgId, "Acme Project", "desc", "ACME", null, null, ProjectVisibility.PRIVATE);

        var response = projectService.create(request);

        assertThat(response.projectKey()).isEqualTo("ACME");
        assertThat(response.status()).isEqualTo(ProjectStatus.ACTIVE);
        assertThat(response.health()).isEqualTo(ProjectHealth.UNKNOWN);
        assertThat(response.createdBy()).isEqualTo(userId);

        ArgumentCaptor<ProjectMember> memberCaptor = ArgumentCaptor.forClass(ProjectMember.class);
        verify(memberRepository).save(memberCaptor.capture());
        ProjectMember membership = memberCaptor.getValue();
        assertThat(membership.getUserId()).isEqualTo(userId);
        assertThat(membership.getRole()).isEqualTo(ProjectRole.PROJECT_OWNER);
        assertThat(membership.getStatus()).isEqualTo(MemberStatus.ACTIVE);

        ArgumentCaptor<ProjectSettings> settingsCaptor = ArgumentCaptor.forClass(ProjectSettings.class);
        verify(settingsRepository).save(settingsCaptor.capture());
        assertThat(settingsCaptor.getValue().getProjectId()).isEqualTo(response.id());

        verify(activityService).record(eq(response.id()), eq(userId), eq("PROJECT_CREATED"), any(), any());
        verify(eventPublisher).publish(eq(ProjectEventType.PROJECT_CREATED), any(), any());
    }

    @Test
    void createThrowsOnDuplicateKey() {
        when(currentUserResolver.requireCurrentUserId()).thenReturn(userId);
        doNothing().when(authorizationService).requireCreateInOrganization(orgId, userId);
        when(projectRepository.existsByOrganizationIdAndProjectKeyIgnoreCase(orgId, "ACME")).thenReturn(true);

        CreateProjectRequest request = new CreateProjectRequest(
                orgId, "Acme", null, "ACME", null, null, null);

        assertThatThrownBy(() -> projectService.create(request))
                .isInstanceOf(DuplicateProjectException.class)
                .hasMessageContaining("ACME");
    }

    @Test
    void updateStatusPublishesStatusChangedEvent() {
        UUID projectId = UUID.randomUUID();
        Project project = new Project();
        ReflectionTestUtils.setField(project, "id", projectId);
        project.setStatus(ProjectStatus.ACTIVE);
        project.setHealth(ProjectHealth.UNKNOWN);

        when(currentUserResolver.requireCurrentUserId()).thenReturn(userId);
        when(projectRepository.findById(projectId)).thenReturn(java.util.Optional.of(project));
        doNothing().when(authorizationService).requireUpdate(project, userId);
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));
        when(projectMapper.toResponse(any(Project.class))).thenAnswer(inv -> {
            Project p = inv.getArgument(0);
            return new com.devflow.project.dto.ProjectResponse(
                    p.getId(), orgId, "n", "s", null, "KEY", null,
                    p.getStatus(), p.getHealth(), ProjectVisibility.PRIVATE,
                    userId, null, 0L, null, null);
        });

        var response = projectService.updateStatus(projectId, new UpdateProjectStatusRequest(ProjectStatus.ON_HOLD));

        assertThat(response.status()).isEqualTo(ProjectStatus.ON_HOLD);
        verify(eventPublisher).publish(eq(ProjectEventType.PROJECT_STATUS_CHANGED), eq(projectId.toString()), any());
        verify(activityService).record(eq(projectId), eq(userId), eq("PROJECT_STATUS_CHANGED"), any(), any());
    }

    @Test
    void updateStatusRejectsArchiveViaPatch() {
        UUID projectId = UUID.randomUUID();
        Project project = new Project();
        ReflectionTestUtils.setField(project, "id", projectId);
        project.setStatus(ProjectStatus.ACTIVE);

        when(currentUserResolver.requireCurrentUserId()).thenReturn(userId);
        when(projectRepository.findById(projectId)).thenReturn(java.util.Optional.of(project));
        doNothing().when(authorizationService).requireUpdate(project, userId);

        assertThatThrownBy(() ->
                projectService.updateStatus(projectId, new UpdateProjectStatusRequest(ProjectStatus.ARCHIVED)))
                .isInstanceOf(InvalidProjectStatusException.class);
    }

    @Test
    void updateHealthPublishesHealthChangedEvent() {
        UUID projectId = UUID.randomUUID();
        Project project = new Project();
        ReflectionTestUtils.setField(project, "id", projectId);
        project.setStatus(ProjectStatus.ACTIVE);
        project.setHealth(ProjectHealth.UNKNOWN);

        when(currentUserResolver.requireCurrentUserId()).thenReturn(userId);
        when(projectRepository.findById(projectId)).thenReturn(java.util.Optional.of(project));
        doNothing().when(authorizationService).requireUpdate(project, userId);
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));
        when(projectMapper.toResponse(any(Project.class))).thenAnswer(inv -> {
            Project p = inv.getArgument(0);
            return new com.devflow.project.dto.ProjectResponse(
                    p.getId(), orgId, "n", "s", null, "KEY", null,
                    p.getStatus(), p.getHealth(), ProjectVisibility.PRIVATE,
                    userId, null, 0L, null, null);
        });

        var response = projectService.updateHealth(projectId, new UpdateProjectHealthRequest(ProjectHealth.AT_RISK));

        assertThat(response.health()).isEqualTo(ProjectHealth.AT_RISK);
        verify(eventPublisher).publish(eq(ProjectEventType.PROJECT_HEALTH_CHANGED), eq(projectId.toString()), any());
    }
}

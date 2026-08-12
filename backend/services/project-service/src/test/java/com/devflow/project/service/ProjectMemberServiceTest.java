package com.devflow.project.service;

import com.devflow.common.exception.ConflictException;
import com.devflow.project.client.UserClient;
import com.devflow.project.entity.MemberStatus;
import com.devflow.project.entity.Project;
import com.devflow.project.entity.ProjectMember;
import com.devflow.project.entity.ProjectRole;
import com.devflow.project.events.ProjectEventPublisher;
import com.devflow.project.exception.ProjectMemberNotFoundException;
import com.devflow.project.mapper.ProjectMemberMapper;
import com.devflow.project.repository.ProjectMemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectMemberServiceTest {

    @Mock private ProjectMemberRepository memberRepository;
    @Mock private ProjectService projectService;
    @Mock private ProjectAuthorizationService authorizationService;
    @Mock private ProjectMemberMapper memberMapper;
    @Mock private ProjectEventPublisher eventPublisher;
    @Mock private ProjectActivityService activityService;
    @Mock private CurrentUserResolver currentUserResolver;
    @Mock private UserClient userClient;

    @InjectMocks
    private ProjectMemberService memberService;

    private UUID projectId;
    private UUID actorId;
    private UUID ownerId;
    private Project project;

    @BeforeEach
    void setUp() {
        projectId = UUID.randomUUID();
        actorId = UUID.randomUUID();
        ownerId = UUID.randomUUID();
        project = new Project();
        ReflectionTestUtils.setField(project, "id", projectId);
    }

    @Test
    void cannotRemoveLastOwner() {
        when(currentUserResolver.requireCurrentUserId()).thenReturn(actorId);
        when(projectService.requireProject(projectId)).thenReturn(project);
        doNothing().when(authorizationService).requireManageMembers(project, actorId);

        ProjectMember owner = new ProjectMember();
        owner.setProjectId(projectId);
        owner.setUserId(ownerId);
        owner.setRole(ProjectRole.PROJECT_OWNER);
        owner.setStatus(MemberStatus.ACTIVE);

        when(memberRepository.findByProjectIdAndUserId(projectId, ownerId)).thenReturn(Optional.of(owner));
        when(memberRepository.countByProjectIdAndRoleAndStatus(
                projectId, ProjectRole.PROJECT_OWNER, MemberStatus.ACTIVE)).thenReturn(1L);

        assertThatThrownBy(() -> memberService.remove(projectId, ownerId))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("last project owner");
    }

    @Test
    void removeMissingMemberThrows() {
        when(currentUserResolver.requireCurrentUserId()).thenReturn(actorId);
        when(projectService.requireProject(projectId)).thenReturn(project);
        doNothing().when(authorizationService).requireManageMembers(project, actorId);
        when(memberRepository.findByProjectIdAndUserId(projectId, ownerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> memberService.remove(projectId, ownerId))
                .isInstanceOf(ProjectMemberNotFoundException.class);
    }

    @Test
    void cannotSoftRemoveLastOwnerViaStatusPatch() {
        when(currentUserResolver.requireCurrentUserId()).thenReturn(actorId);
        when(projectService.requireProject(projectId)).thenReturn(project);
        doNothing().when(authorizationService).requireManageMembers(project, actorId);

        ProjectMember owner = new ProjectMember();
        owner.setProjectId(projectId);
        owner.setUserId(ownerId);
        owner.setRole(ProjectRole.PROJECT_OWNER);
        owner.setStatus(MemberStatus.ACTIVE);

        when(memberRepository.findByProjectIdAndUserId(projectId, ownerId)).thenReturn(Optional.of(owner));
        when(memberRepository.countByProjectIdAndRoleAndStatus(
                projectId, ProjectRole.PROJECT_OWNER, MemberStatus.ACTIVE)).thenReturn(1L);

        assertThatThrownBy(() -> memberService.update(
                projectId, ownerId, new com.devflow.project.dto.UpdateProjectMemberRequest(null, MemberStatus.REMOVED)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("last project owner");
    }
}

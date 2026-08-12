package com.devflow.project.service;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.common.exception.ConflictException;
import com.devflow.common.exception.NotFoundException;
import com.devflow.project.client.UserClient;
import com.devflow.project.client.UserResponse;
import com.devflow.project.dto.AddProjectMemberRequest;
import com.devflow.project.dto.ProjectMemberResponse;
import com.devflow.project.dto.UpdateProjectMemberRequest;
import com.devflow.project.entity.MemberStatus;
import com.devflow.project.entity.Project;
import com.devflow.project.entity.ProjectMember;
import com.devflow.project.entity.ProjectRole;
import com.devflow.project.events.ProjectEventPublisher;
import com.devflow.project.events.ProjectEventType;
import com.devflow.project.exception.ProjectAccessDeniedException;
import com.devflow.project.exception.ProjectMemberNotFoundException;
import com.devflow.project.mapper.ProjectMemberMapper;
import com.devflow.project.repository.ProjectMemberRepository;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class ProjectMemberService {

    private static final Logger log = LoggerFactory.getLogger(ProjectMemberService.class);

    private final ProjectMemberRepository memberRepository;
    private final ProjectService projectService;
    private final ProjectAuthorizationService authorizationService;
    private final ProjectMemberMapper memberMapper;
    private final ProjectEventPublisher eventPublisher;
    private final ProjectActivityService activityService;
    private final CurrentUserResolver currentUserResolver;
    private final UserClient userClient;

    public ProjectMemberService(
            ProjectMemberRepository memberRepository,
            ProjectService projectService,
            ProjectAuthorizationService authorizationService,
            ProjectMemberMapper memberMapper,
            ProjectEventPublisher eventPublisher,
            ProjectActivityService activityService,
            CurrentUserResolver currentUserResolver,
            UserClient userClient
    ) {
        this.memberRepository = memberRepository;
        this.projectService = projectService;
        this.authorizationService = authorizationService;
        this.memberMapper = memberMapper;
        this.eventPublisher = eventPublisher;
        this.activityService = activityService;
        this.currentUserResolver = currentUserResolver;
        this.userClient = userClient;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProjectMemberResponse> list(UUID projectId, Integer page, Integer size) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = projectService.requireProject(projectId);
        authorizationService.requireRead(project, actorId);
        Page<ProjectMember> result = memberRepository.findByProjectId(projectId, PageSupport.pageable(page, size));
        return PageSupport.map(result, memberMapper::toResponse);
    }

    @Transactional
    public ProjectMemberResponse add(UUID projectId, AddProjectMemberRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = projectService.requireProject(projectId);
        authorizationService.requireManageMembers(project, actorId);

        if (request.role() == ProjectRole.PROJECT_OWNER) {
            throw new ProjectAccessDeniedException("Use ownership transfer to assign PROJECT_OWNER");
        }

        verifyUserExists(request.userId());

        ProjectMember existing = memberRepository.findByProjectIdAndUserId(projectId, request.userId()).orElse(null);
        if (existing != null && existing.getStatus() != MemberStatus.REMOVED) {
            throw new ConflictException("User is already a member of the project");
        }

        ProjectMember member;
        if (existing != null) {
            member = existing;
            member.setRole(request.role());
            member.setStatus(MemberStatus.ACTIVE);
            member.setJoinedAt(Instant.now());
        } else {
            member = new ProjectMember();
            member.setProjectId(projectId);
            member.setUserId(request.userId());
            member.setRole(request.role());
            member.setStatus(MemberStatus.ACTIVE);
            member.setJoinedAt(Instant.now());
        }
        member = memberRepository.save(member);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("projectId", projectId.toString());
        payload.put("userId", request.userId().toString());
        payload.put("role", request.role().name());
        payload.put("actorUserId", actorId.toString());
        activityService.record(projectId, actorId, ProjectEventType.PROJECT_MEMBER_ADDED.name(),
                "Member added", payload);
        eventPublisher.publish(ProjectEventType.PROJECT_MEMBER_ADDED, projectId.toString(), payload);
        log.info("eventType=PROJECT_MEMBER_ADDED userId={} projectId={} result=success", actorId, projectId);
        return memberMapper.toResponse(member);
    }

    @Transactional
    public ProjectMemberResponse update(UUID projectId, UUID userId, UpdateProjectMemberRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = projectService.requireProject(projectId);
        authorizationService.requireManageMembers(project, actorId);

        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ProjectMemberNotFoundException(projectId, userId));

        if (request.role() != null) {
            if (request.role() == ProjectRole.PROJECT_OWNER) {
                throw new ProjectAccessDeniedException("Use ownership transfer to assign PROJECT_OWNER");
            }
            if (member.getRole() == ProjectRole.PROJECT_OWNER && request.role() != ProjectRole.PROJECT_OWNER) {
                ensureNotLastOwner(projectId, userId);
            }
            member.setRole(request.role());
        }
        boolean softRemoving = false;
        if (request.status() != null) {
            // Any transition away from ACTIVE for an owner (INACTIVE or REMOVED) must preserve ≥1 owner.
            if (member.getRole() == ProjectRole.PROJECT_OWNER
                    && member.getStatus() == MemberStatus.ACTIVE
                    && request.status() != MemberStatus.ACTIVE) {
                ensureNotLastOwner(projectId, userId);
            }
            softRemoving = request.status() == MemberStatus.REMOVED
                    && member.getStatus() != MemberStatus.REMOVED;
            member.setStatus(request.status());
        }

        member = memberRepository.save(member);
        Map<String, Object> payload = Map.of(
                "projectId", projectId.toString(),
                "userId", userId.toString(),
                "role", member.getRole().name(),
                "status", member.getStatus().name(),
                "actorUserId", actorId.toString()
        );
        if (softRemoving) {
            activityService.record(projectId, actorId, ProjectEventType.PROJECT_MEMBER_REMOVED.name(),
                    "Member removed", payload);
            eventPublisher.publish(ProjectEventType.PROJECT_MEMBER_REMOVED, projectId.toString(), payload);
        } else {
            activityService.record(projectId, actorId, ProjectEventType.PROJECT_MEMBER_ROLE_CHANGED.name(),
                    "Member updated", payload);
            eventPublisher.publish(ProjectEventType.PROJECT_MEMBER_ROLE_CHANGED, projectId.toString(), payload);
        }
        return memberMapper.toResponse(member);
    }

    @Transactional
    public void remove(UUID projectId, UUID userId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = projectService.requireProject(projectId);
        authorizationService.requireManageMembers(project, actorId);

        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ProjectMemberNotFoundException(projectId, userId));

        if (member.getRole() == ProjectRole.PROJECT_OWNER) {
            ensureNotLastOwner(projectId, userId);
        }

        // Soft-remove: retain row for audit; re-add reactivates the same unique (project_id, user_id) row.
        member.setStatus(MemberStatus.REMOVED);
        memberRepository.save(member);
        Map<String, Object> payload = Map.of(
                "projectId", projectId.toString(),
                "userId", userId.toString(),
                "actorUserId", actorId.toString()
        );
        activityService.record(projectId, actorId, ProjectEventType.PROJECT_MEMBER_REMOVED.name(),
                "Member removed", payload);
        eventPublisher.publish(ProjectEventType.PROJECT_MEMBER_REMOVED, projectId.toString(), payload);
        log.info("eventType=PROJECT_MEMBER_REMOVED userId={} projectId={} result=success", actorId, projectId);
    }

    void ensureNotLastOwner(UUID projectId, UUID userId) {
        long owners = memberRepository.countByProjectIdAndRoleAndStatus(
                projectId, ProjectRole.PROJECT_OWNER, MemberStatus.ACTIVE);
        ProjectMember target = memberRepository.findByProjectIdAndUserId(projectId, userId).orElse(null);
        boolean targetIsActiveOwner = target != null
                && target.getRole() == ProjectRole.PROJECT_OWNER
                && target.getStatus() == MemberStatus.ACTIVE;
        if (targetIsActiveOwner && owners <= 1) {
            throw new ConflictException("Cannot remove or demote the last project owner");
        }
    }

    private void verifyUserExists(UUID userId) {
        try {
            ApiResponse<UserResponse> response = userClient.getById(userId);
            if (response == null || !response.success() || response.data() == null) {
                throw new NotFoundException("User not found: " + userId);
            }
        } catch (FeignException.NotFound ex) {
            throw new NotFoundException("User not found: " + userId);
        }
    }
}

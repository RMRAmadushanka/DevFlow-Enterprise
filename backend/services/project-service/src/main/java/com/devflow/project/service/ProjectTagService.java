package com.devflow.project.service;

import com.devflow.common.exception.ConflictException;
import com.devflow.common.exception.NotFoundException;
import com.devflow.project.dto.CreateProjectTagRequest;
import com.devflow.project.dto.ProjectTagResponse;
import com.devflow.project.dto.UpdateProjectTagRequest;
import com.devflow.project.entity.Project;
import com.devflow.project.entity.ProjectTag;
import com.devflow.project.events.ProjectEventPublisher;
import com.devflow.project.events.ProjectEventType;
import com.devflow.project.repository.ProjectTagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ProjectTagService {

    private final ProjectTagRepository tagRepository;
    private final ProjectService projectService;
    private final ProjectAuthorizationService authorizationService;
    private final ProjectEventPublisher eventPublisher;
    private final ProjectActivityService activityService;
    private final CurrentUserResolver currentUserResolver;

    public ProjectTagService(
            ProjectTagRepository tagRepository,
            ProjectService projectService,
            ProjectAuthorizationService authorizationService,
            ProjectEventPublisher eventPublisher,
            ProjectActivityService activityService,
            CurrentUserResolver currentUserResolver
    ) {
        this.tagRepository = tagRepository;
        this.projectService = projectService;
        this.authorizationService = authorizationService;
        this.eventPublisher = eventPublisher;
        this.activityService = activityService;
        this.currentUserResolver = currentUserResolver;
    }

    @Transactional(readOnly = true)
    public List<ProjectTagResponse> list(UUID projectId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = projectService.requireProject(projectId);
        authorizationService.requireRead(project, actorId);
        return tagRepository.findByProjectIdOrderByNameAsc(projectId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ProjectTagResponse create(UUID projectId, CreateProjectTagRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = projectService.requireProject(projectId);
        authorizationService.requireManageTags(project, actorId);

        String name = request.name().trim();
        if (tagRepository.existsByProjectIdAndNameIgnoreCase(projectId, name)) {
            throw new ConflictException("Tag already exists: " + name);
        }

        ProjectTag tag = new ProjectTag();
        tag.setProjectId(projectId);
        tag.setName(name);
        tag.setColor(request.color());
        tag = tagRepository.save(tag);
        Map<String, Object> payload = Map.of(
                "projectId", projectId.toString(),
                "tagId", tag.getId().toString(),
                "name", tag.getName(),
                "actorUserId", actorId.toString()
        );
        activityService.record(projectId, actorId, ProjectEventType.PROJECT_TAG_CREATED.name(),
                "Project tag created", payload);
        eventPublisher.publish(ProjectEventType.PROJECT_TAG_CREATED, projectId.toString(), payload);
        return toResponse(tag);
    }

    @Transactional
    public ProjectTagResponse update(UUID projectId, UUID tagId, UpdateProjectTagRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = projectService.requireProject(projectId);
        authorizationService.requireManageTags(project, actorId);

        ProjectTag tag = tagRepository.findByIdAndProjectId(tagId, projectId)
                .orElseThrow(() -> new NotFoundException("Tag not found: " + tagId));

        if (request.name() != null) {
            String name = request.name().trim();
            tagRepository.findByProjectIdOrderByNameAsc(projectId).stream()
                    .filter(t -> t.getName().equalsIgnoreCase(name) && !t.getId().equals(tagId))
                    .findFirst()
                    .ifPresent(t -> {
                        throw new ConflictException("Tag already exists: " + name);
                    });
            tag.setName(name);
        }
        if (request.color() != null) {
            tag.setColor(request.color());
        }
        tag = tagRepository.save(tag);
        Map<String, Object> payload = Map.of(
                "projectId", projectId.toString(),
                "tagId", tagId.toString(),
                "actorUserId", actorId.toString()
        );
        activityService.record(projectId, actorId, ProjectEventType.PROJECT_TAG_UPDATED.name(),
                "Project tag updated", payload);
        eventPublisher.publish(ProjectEventType.PROJECT_TAG_UPDATED, projectId.toString(), payload);
        return toResponse(tag);
    }

    @Transactional
    public void delete(UUID projectId, UUID tagId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = projectService.requireProject(projectId);
        authorizationService.requireManageTags(project, actorId);

        ProjectTag tag = tagRepository.findByIdAndProjectId(tagId, projectId)
                .orElseThrow(() -> new NotFoundException("Tag not found: " + tagId));
        tagRepository.delete(tag);
        Map<String, Object> payload = Map.of(
                "projectId", projectId.toString(),
                "tagId", tagId.toString(),
                "actorUserId", actorId.toString()
        );
        activityService.record(projectId, actorId, ProjectEventType.PROJECT_TAG_DELETED.name(),
                "Project tag deleted", payload);
        eventPublisher.publish(ProjectEventType.PROJECT_TAG_DELETED, projectId.toString(), payload);
    }

    private ProjectTagResponse toResponse(ProjectTag tag) {
        return new ProjectTagResponse(
                tag.getId(),
                tag.getProjectId(),
                tag.getName(),
                tag.getColor(),
                tag.getCreatedAt(),
                tag.getUpdatedAt()
        );
    }
}

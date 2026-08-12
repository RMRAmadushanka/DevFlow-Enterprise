package com.devflow.project.service;

import com.devflow.common.dto.PageResponse;
import com.devflow.project.dto.ProjectActivityResponse;
import com.devflow.project.entity.Project;
import com.devflow.project.entity.ProjectActivity;
import com.devflow.project.exception.ProjectNotFoundException;
import com.devflow.project.repository.ProjectActivityRepository;
import com.devflow.project.repository.ProjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class ProjectActivityService {

    private final ProjectActivityRepository activityRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAuthorizationService authorizationService;
    private final CurrentUserResolver currentUserResolver;

    public ProjectActivityService(
            ProjectActivityRepository activityRepository,
            ProjectRepository projectRepository,
            ProjectAuthorizationService authorizationService,
            CurrentUserResolver currentUserResolver
    ) {
        this.activityRepository = activityRepository;
        this.projectRepository = projectRepository;
        this.authorizationService = authorizationService;
        this.currentUserResolver = currentUserResolver;
    }

    @Transactional
    public void record(UUID projectId, UUID actorUserId, String activityType, String description, Map<String, Object> metadata) {
        ProjectActivity activity = new ProjectActivity();
        activity.setProjectId(projectId);
        activity.setActorUserId(actorUserId);
        activity.setActivityType(activityType);
        activity.setDescription(description);
        activity.setMetadata(metadata);
        activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProjectActivityResponse> list(
            UUID projectId,
            String activityType,
            Integer page,
            Integer size
    ) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));
        authorizationService.requireViewActivity(project, actorId);

        Page<ProjectActivity> result;
        if (activityType != null && !activityType.isBlank()) {
            result = activityRepository.findByProjectIdAndActivityTypeOrderByCreatedAtDesc(
                    projectId, activityType.trim(), PageSupport.pageable(page, size));
        } else {
            result = activityRepository.findByProjectIdOrderByCreatedAtDesc(
                    projectId, PageSupport.pageable(page, size));
        }
        return PageSupport.map(result, this::toResponse);
    }

    private ProjectActivityResponse toResponse(ProjectActivity activity) {
        return new ProjectActivityResponse(
                activity.getId(),
                activity.getProjectId(),
                activity.getActorUserId(),
                activity.getActivityType(),
                activity.getDescription(),
                activity.getMetadata(),
                activity.getCreatedAt()
        );
    }
}

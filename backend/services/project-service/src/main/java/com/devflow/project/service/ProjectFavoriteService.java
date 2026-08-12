package com.devflow.project.service;

import com.devflow.common.dto.PageResponse;
import com.devflow.common.exception.ConflictException;
import com.devflow.project.dto.ProjectFavoriteResponse;
import com.devflow.project.dto.ProjectSummaryResponse;
import com.devflow.project.entity.Project;
import com.devflow.project.entity.ProjectFavorite;
import com.devflow.project.events.ProjectEventPublisher;
import com.devflow.project.events.ProjectEventType;
import com.devflow.project.repository.ProjectFavoriteRepository;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectFavoriteService {

    private final ProjectFavoriteRepository favoriteRepository;
    private final ProjectService projectService;
    private final ProjectAuthorizationService authorizationService;
    private final ProjectEventPublisher eventPublisher;
    private final ProjectActivityService activityService;
    private final CurrentUserResolver currentUserResolver;

    public ProjectFavoriteService(
            ProjectFavoriteRepository favoriteRepository,
            ProjectService projectService,
            ProjectAuthorizationService authorizationService,
            ProjectEventPublisher eventPublisher,
            ProjectActivityService activityService,
            CurrentUserResolver currentUserResolver
    ) {
        this.favoriteRepository = favoriteRepository;
        this.projectService = projectService;
        this.authorizationService = authorizationService;
        this.eventPublisher = eventPublisher;
        this.activityService = activityService;
        this.currentUserResolver = currentUserResolver;
    }

    @Transactional
    public ProjectFavoriteResponse add(UUID projectId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = projectService.requireProject(projectId);
        authorizationService.requireRead(project, actorId);

        if (favoriteRepository.existsByProjectIdAndUserId(projectId, actorId)) {
            throw new ConflictException("Project is already favorited");
        }

        ProjectFavorite favorite = new ProjectFavorite();
        favorite.setProjectId(projectId);
        favorite.setUserId(actorId);
        favorite = favoriteRepository.save(favorite);
        Map<String, Object> payload = Map.of(
                "projectId", projectId.toString(),
                "actorUserId", actorId.toString()
        );
        activityService.record(projectId, actorId, ProjectEventType.PROJECT_FAVORITED.name(),
                "Project favorited", payload);
        eventPublisher.publish(ProjectEventType.PROJECT_FAVORITED, projectId.toString(), payload);
        return new ProjectFavoriteResponse(favorite.getId(), projectId, actorId, favorite.getCreatedAt());
    }

    @Transactional
    public void remove(UUID projectId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = projectService.requireProject(projectId);
        authorizationService.requireRead(project, actorId);
        favoriteRepository.deleteByProjectIdAndUserId(projectId, actorId);
        Map<String, Object> payload = Map.of(
                "projectId", projectId.toString(),
                "actorUserId", actorId.toString()
        );
        activityService.record(projectId, actorId, ProjectEventType.PROJECT_UNFAVORITED.name(),
                "Project unfavorited", payload);
        eventPublisher.publish(ProjectEventType.PROJECT_UNFAVORITED, projectId.toString(), payload);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProjectSummaryResponse> listFavorites(Integer page, Integer size) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Page<ProjectFavorite> favorites = favoriteRepository.findByUserId(actorId, PageSupport.pageable(page, size));
        List<UUID> projectIds = favorites.getContent().stream().map(ProjectFavorite::getProjectId).toList();
        Map<UUID, Project> byId = projectService.findProjectsByIds(projectIds).stream()
                .collect(Collectors.toMap(Project::getId, p -> p, (a, b) -> a));
        List<Project> readableOrdered = projectIds.stream()
                .map(byId::get)
                .filter(Objects::nonNull)
                .filter(p -> authorizationService.canReadProject(p, actorId))
                .toList();
        List<ProjectSummaryResponse> items = projectService.summariesFor(readableOrdered, actorId);
        return new PageResponse<>(
                items,
                favorites.getNumber(),
                favorites.getSize(),
                favorites.getTotalElements(),
                favorites.getTotalPages()
        );
    }
}

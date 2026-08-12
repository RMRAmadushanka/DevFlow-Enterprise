package com.devflow.project.service;

import com.devflow.project.dto.ProjectSettingsResponse;
import com.devflow.project.dto.UpdateProjectSettingsRequest;
import com.devflow.project.entity.Project;
import com.devflow.project.entity.ProjectSettings;
import com.devflow.project.events.ProjectEventPublisher;
import com.devflow.project.events.ProjectEventType;
import com.devflow.project.exception.ProjectNotFoundException;
import com.devflow.project.mapper.ProjectSettingsMapper;
import com.devflow.project.repository.ProjectSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class ProjectSettingsService {

    private final ProjectSettingsRepository settingsRepository;
    private final ProjectService projectService;
    private final ProjectAuthorizationService authorizationService;
    private final ProjectSettingsMapper settingsMapper;
    private final ProjectEventPublisher eventPublisher;
    private final ProjectActivityService activityService;
    private final CurrentUserResolver currentUserResolver;

    public ProjectSettingsService(
            ProjectSettingsRepository settingsRepository,
            ProjectService projectService,
            ProjectAuthorizationService authorizationService,
            ProjectSettingsMapper settingsMapper,
            ProjectEventPublisher eventPublisher,
            ProjectActivityService activityService,
            CurrentUserResolver currentUserResolver
    ) {
        this.settingsRepository = settingsRepository;
        this.projectService = projectService;
        this.authorizationService = authorizationService;
        this.settingsMapper = settingsMapper;
        this.eventPublisher = eventPublisher;
        this.activityService = activityService;
        this.currentUserResolver = currentUserResolver;
    }

    @Transactional(readOnly = true)
    public ProjectSettingsResponse get(UUID projectId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = projectService.requireProject(projectId);
        authorizationService.requireRead(project, actorId);
        return settingsMapper.toResponse(requireSettings(projectId));
    }

    @Transactional
    public ProjectSettingsResponse update(UUID projectId, UpdateProjectSettingsRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = projectService.requireProject(projectId);
        authorizationService.requireManageSettings(project, actorId);

        ProjectSettings settings = requireSettings(projectId);
        if (request.defaultVisibility() != null) {
            settings.setDefaultVisibility(request.defaultVisibility());
        }
        if (request.allowMemberInvites() != null) {
            settings.setAllowMemberInvites(request.allowMemberInvites());
        }
        if (request.allowGuestAccess() != null) {
            settings.setAllowGuestAccess(request.allowGuestAccess());
        }
        if (request.timezone() != null) {
            settings.setTimezone(request.timezone());
        }
        if (request.defaultProjectView() != null) {
            settings.setDefaultProjectView(request.defaultProjectView());
        }
        settings = settingsRepository.save(settings);
        Map<String, Object> payload = Map.of(
                "projectId", projectId.toString(),
                "actorUserId", actorId.toString()
        );
        activityService.record(projectId, actorId, ProjectEventType.PROJECT_SETTINGS_UPDATED.name(),
                "Project settings updated", payload);
        eventPublisher.publish(ProjectEventType.PROJECT_SETTINGS_UPDATED, projectId.toString(), payload);
        return settingsMapper.toResponse(settings);
    }

    private ProjectSettings requireSettings(UUID projectId) {
        return settingsRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));
    }
}

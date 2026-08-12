package com.devflow.project.mapper;

import com.devflow.project.dto.ProjectSettingsResponse;
import com.devflow.project.entity.ProjectSettings;
import org.springframework.stereotype.Component;

@Component
public class ProjectSettingsMapper {

    public ProjectSettingsResponse toResponse(ProjectSettings settings) {
        return new ProjectSettingsResponse(
                settings.getId(),
                settings.getProjectId(),
                settings.getDefaultVisibility(),
                settings.isAllowMemberInvites(),
                settings.isAllowGuestAccess(),
                settings.getTimezone(),
                settings.getDefaultProjectView(),
                settings.getVersion(),
                settings.getCreatedAt(),
                settings.getUpdatedAt()
        );
    }
}

package com.devflow.project.dto;

import com.devflow.project.entity.ProjectView;
import com.devflow.project.entity.ProjectVisibility;
import jakarta.validation.constraints.Size;

public record UpdateProjectSettingsRequest(
        ProjectVisibility defaultVisibility,
        Boolean allowMemberInvites,
        Boolean allowGuestAccess,
        @Size(max = 64) String timezone,
        ProjectView defaultProjectView
) {
}

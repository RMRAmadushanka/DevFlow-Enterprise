package com.devflow.project.dto;

import com.devflow.project.entity.ProjectHealth;
import com.devflow.project.entity.ProjectStatus;
import com.devflow.project.entity.ProjectVisibility;
import jakarta.validation.constraints.Size;

public record UpdateProjectRequest(
        @Size(min = 2, max = 160) String name,
        @Size(max = 2000) String description,
        @Size(max = 64) String icon,
        ProjectStatus status,
        ProjectHealth health,
        ProjectVisibility visibility
) {
}

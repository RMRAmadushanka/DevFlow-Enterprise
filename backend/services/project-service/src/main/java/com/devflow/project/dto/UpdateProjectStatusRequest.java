package com.devflow.project.dto;

import com.devflow.project.entity.ProjectStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateProjectStatusRequest(
        @NotNull ProjectStatus status
) {
}

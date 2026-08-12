package com.devflow.project.dto;

import com.devflow.project.entity.ProjectHealth;
import jakarta.validation.constraints.NotNull;

public record UpdateProjectHealthRequest(
        @NotNull ProjectHealth health
) {
}

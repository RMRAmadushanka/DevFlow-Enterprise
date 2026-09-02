package com.devflow.sprint.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record CreateSprintRequest(
        @NotBlank @Size(max = 160) String name,
        @Size(max = 500) String goal,
        @Size(max = 4000) String description,
        @NotNull UUID projectId,
        @NotBlank @Size(max = 160) String projectName,
        UUID organizationId,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @Min(0) @Max(1000) int capacityPoints,
        @Min(0) @Max(1000) int storyPointGoal,
        UUID releaseId
) {
}

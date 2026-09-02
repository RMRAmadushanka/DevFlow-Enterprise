package com.devflow.sprint.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateSprintRequest(
        @Size(max = 160) String name,
        @Size(max = 500) String goal,
        @Size(max = 4000) String description,
        UUID projectId,
        @Size(max = 160) String projectName,
        UUID organizationId,
        LocalDate startDate,
        LocalDate endDate,
        @Min(0) @Max(1000) Integer capacityPoints,
        @Min(0) @Max(1000) Integer storyPointGoal,
        String status,
        Boolean archived,
        UUID releaseId
) {
}

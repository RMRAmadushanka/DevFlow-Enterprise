package com.devflow.sprint.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record SprintResponse(
        UUID id,
        String name,
        String goal,
        String description,
        UUID projectId,
        String projectName,
        String status,
        LocalDate startDate,
        LocalDate endDate,
        int capacityPoints,
        int storyPointGoal,
        int completedPoints,
        int committedPoints,
        int taskCount,
        int completedTaskCount,
        int velocity,
        String health,
        boolean archived,
        UUID releaseId,
        String releaseName,
        Instant createdAt,
        Instant updatedAt
) {
}

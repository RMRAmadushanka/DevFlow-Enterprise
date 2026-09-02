package com.devflow.sprint.dto;

import java.time.Instant;
import java.util.UUID;

public record SprintReviewResponse(
        UUID sprintId,
        int velocity,
        int completedPoints,
        int incompleteCount,
        String deploymentSummary,
        String teamPerformance,
        Instant updatedAt
) {
}

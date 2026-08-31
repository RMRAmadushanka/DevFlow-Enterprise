package com.devflow.sprint.dto;

/**
 * task-service's {@code GET /api/tasks/sprint-summary} response shape (sprint-service's own copy).
 */
public record TaskSprintSummaryResponse(
        int taskCount,
        int completedTaskCount,
        int committedPoints,
        int completedPoints
) {
}

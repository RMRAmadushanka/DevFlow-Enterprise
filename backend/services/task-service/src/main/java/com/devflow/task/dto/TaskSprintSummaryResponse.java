package com.devflow.task.dto;

public record TaskSprintSummaryResponse(
        int taskCount,
        int completedTaskCount,
        int committedPoints,
        int completedPoints
) {
}

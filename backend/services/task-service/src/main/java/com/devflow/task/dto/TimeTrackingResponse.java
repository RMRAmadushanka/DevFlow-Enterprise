package com.devflow.task.dto;

public record TimeTrackingResponse(
        Integer estimatedMinutes,
        int loggedMinutes
) {
}

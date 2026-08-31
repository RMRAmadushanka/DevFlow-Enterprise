package com.devflow.sprint.dto;

import java.time.LocalDate;
import java.util.UUID;

public record VelocityPointResponse(
        UUID sprintId,
        String sprintName,
        LocalDate endDate,
        int committedPoints,
        int completedPoints
) {
}

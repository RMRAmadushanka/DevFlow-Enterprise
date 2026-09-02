package com.devflow.analytics.dto;

import java.time.LocalDate;
import java.util.UUID;

public record VelocityTrendPointResponse(
        UUID sprintId,
        String sprintName,
        Integer committedPoints,
        Integer completedPoints,
        LocalDate endDate
) {
}

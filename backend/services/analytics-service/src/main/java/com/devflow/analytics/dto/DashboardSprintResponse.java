package com.devflow.analytics.dto;

import java.time.LocalDate;
import java.util.UUID;

public record DashboardSprintResponse(
        UUID sprintId,
        String name,
        String status,
        LocalDate startDate,
        LocalDate endDate,
        Integer committedPoints,
        Integer completedPoints,
        Integer velocity,
        String health
) {
}

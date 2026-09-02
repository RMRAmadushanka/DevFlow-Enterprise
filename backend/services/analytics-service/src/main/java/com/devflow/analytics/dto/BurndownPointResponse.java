package com.devflow.analytics.dto;

import java.time.LocalDate;

public record BurndownPointResponse(
        LocalDate date,
        Integer remainingPoints,
        Integer idealPoints,
        Integer completedPoints
) {
}

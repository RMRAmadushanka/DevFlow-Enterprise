package com.devflow.sprint.dto;

import java.time.LocalDate;

public record BurndownPointResponse(
        LocalDate date,
        int remainingPoints,
        int idealPoints,
        int completedPoints,
        boolean synthesized
) {
}

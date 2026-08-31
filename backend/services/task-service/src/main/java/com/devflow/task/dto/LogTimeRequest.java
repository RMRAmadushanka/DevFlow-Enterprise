package com.devflow.task.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record LogTimeRequest(
        @Min(1) int minutes,
        @Size(max = 500) String note
) {
}

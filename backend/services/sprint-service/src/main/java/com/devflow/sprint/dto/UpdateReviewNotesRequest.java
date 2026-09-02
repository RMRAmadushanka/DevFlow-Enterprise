package com.devflow.sprint.dto;

import jakarta.validation.constraints.Size;

public record UpdateReviewNotesRequest(
        @Size(max = 4000) String deploymentSummary,
        @Size(max = 4000) String teamPerformance
) {
}

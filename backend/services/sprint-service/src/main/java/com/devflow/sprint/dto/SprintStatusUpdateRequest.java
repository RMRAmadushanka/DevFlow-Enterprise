package com.devflow.sprint.dto;

import jakarta.validation.constraints.NotBlank;

public record SprintStatusUpdateRequest(
        @NotBlank String status
) {
}

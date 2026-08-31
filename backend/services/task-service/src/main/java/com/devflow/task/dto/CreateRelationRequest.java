package com.devflow.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateRelationRequest(
        @NotBlank String type,
        @NotNull UUID targetTaskId
) {
}

package com.devflow.task.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record BulkMoveToSprintRequest(
        @NotEmpty List<UUID> taskIds,
        @NotNull UUID projectId,
        @NotNull UUID toSprintId
) {
}

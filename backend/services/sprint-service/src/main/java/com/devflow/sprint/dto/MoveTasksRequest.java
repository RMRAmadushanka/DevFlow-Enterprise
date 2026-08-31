package com.devflow.sprint.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record MoveTasksRequest(
        @NotEmpty List<UUID> taskIds,
        @NotNull UUID projectId
) {
}

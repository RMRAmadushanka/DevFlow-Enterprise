package com.devflow.sprint.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ReorderBacklogRequest(
        @NotNull UUID projectId,
        @NotEmpty List<UUID> orderedTaskIds
) {
}

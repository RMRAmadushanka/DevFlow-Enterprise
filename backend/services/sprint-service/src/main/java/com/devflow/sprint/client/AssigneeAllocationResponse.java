package com.devflow.sprint.client;

import java.util.UUID;

/**
 * task-service's {@code GET /api/tasks/sprint-allocation} response shape: live per-assignee
 * allocated story points for a sprint, used by {@link com.devflow.sprint.service.CapacityService}.
 */
public record AssigneeAllocationResponse(
        UUID assigneeId,
        String assigneeName,
        int allocatedPoints
) {
}

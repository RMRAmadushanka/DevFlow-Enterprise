package com.devflow.task.dto;

import java.util.UUID;

public record AssigneeAllocationResponse(
        UUID assigneeId,
        String assigneeName,
        int allocatedPoints
) {
}

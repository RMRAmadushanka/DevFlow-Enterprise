package com.devflow.sprint.dto;

import java.util.List;

public record PlanningStateResponse(
        List<BacklogItemResponse> backlog,
        List<BacklogItemResponse> sprintTasks,
        int capacityPoints,
        int allocatedPoints
) {
}

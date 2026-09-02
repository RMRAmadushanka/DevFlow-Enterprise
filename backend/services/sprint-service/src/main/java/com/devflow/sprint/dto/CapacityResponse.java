package com.devflow.sprint.dto;

import java.util.List;
import java.util.UUID;

public record CapacityResponse(
        UUID sprintId,
        List<CapacityMemberResponse> members
) {
}

package com.devflow.sprint.dto;

import java.util.UUID;

/**
 * One row of the capacity-vs-allocation view: {@code capacityPoints} comes from the persisted
 * {@code sprint_member_capacity} table, {@code allocatedPoints} from task-service's live
 * sprint-allocation feed. A user missing from either side defaults to 0 on that side.
 */
public record CapacityMemberResponse(
        UUID userId,
        String userName,
        int capacityPoints,
        int allocatedPoints
) {
}

package com.devflow.sprint.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record SetCapacityRequest(
        @NotNull List<@Valid Member> members
) {
    public record Member(
            @NotNull UUID userId,
            String userName,
            @Min(0) int capacityPoints
    ) {
    }
}

package com.devflow.organization.dto;

import com.devflow.organization.enums.TeamRole;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddTeamMemberRequest(
        @NotNull UUID userId,
        @NotNull TeamRole role
) {
}

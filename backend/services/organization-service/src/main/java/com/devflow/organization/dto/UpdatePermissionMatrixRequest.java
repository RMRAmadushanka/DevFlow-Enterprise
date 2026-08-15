package com.devflow.organization.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record UpdatePermissionMatrixRequest(
        @NotEmpty @Valid List<PermissionMatrixGrantDto> grants
) {
}

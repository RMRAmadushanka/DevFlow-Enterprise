package com.devflow.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PermissionMatrixGrantDto(
        @NotBlank String roleCode,
        @NotNull List<String> permissionCodes
) {
}

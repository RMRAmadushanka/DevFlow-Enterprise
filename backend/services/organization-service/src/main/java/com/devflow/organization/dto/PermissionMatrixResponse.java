package com.devflow.organization.dto;

import java.util.List;

public record PermissionMatrixResponse(
        List<PermissionMatrixRoleDto> roles,
        List<PermissionMatrixPermissionDto> permissions,
        List<PermissionMatrixGrantDto> grants,
        boolean customized
) {
}

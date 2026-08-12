package com.devflow.organization.dto;

import com.devflow.organization.enums.RoleScope;

import java.util.UUID;

public record RoleResponse(
        UUID id,
        String code,
        String name,
        RoleScope scope,
        String description
) {
}

package com.devflow.project.client;

import java.util.UUID;

/** Org-service permission projection used for project.create / project.read checks. */
public record OrgPermissionResponse(
        UUID id,
        String code,
        String name,
        String description
) {
}

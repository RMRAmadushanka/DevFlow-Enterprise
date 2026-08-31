package com.devflow.sprint.client;

import java.util.UUID;

/** Org-service permission projection used for sprint.* checks. */
public record OrgPermissionResponse(
        UUID id,
        String code,
        String name,
        String description
) {
}

package com.devflow.analytics.client;

import java.util.UUID;

/** Org-service permission projection used for sprint.* checks (analytics is read-only). */
public record OrgPermissionResponse(
        UUID id,
        String code,
        String name,
        String description
) {
}

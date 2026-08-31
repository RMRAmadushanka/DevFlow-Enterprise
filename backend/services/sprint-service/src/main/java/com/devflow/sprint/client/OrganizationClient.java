package com.devflow.sprint.client;

import com.devflow.common.api.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

/**
 * Synchronous org authorization: sprint.* permissions via Feign.
 * sprint-service has no local membership/role table, so permission resolution is purely
 * "does the org-level permission set for this user contain the required sprint.* code".
 */
@FeignClient(
        name = "organization-service",
        url = "${devflow.clients.organization-service-url:http://localhost:8083}",
        configuration = FeignClientConfig.class
)
public interface OrganizationClient {

    @GetMapping("/api/organizations/{organizationId}/members/{userId}/permissions")
    ApiResponse<List<OrgPermissionResponse>> memberPermissions(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("userId") UUID userId
    );
}

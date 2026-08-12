package com.devflow.project.client;

import com.devflow.common.api.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

/**
 * Synchronous org authorization: project.create / project.read (and organization.read) via Feign.
 * Avoids duplicating org RBAC inside project-service.
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

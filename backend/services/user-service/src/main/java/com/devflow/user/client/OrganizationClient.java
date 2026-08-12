package com.devflow.user.client;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.user.dto.OrganizationSummaryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

/**
 * Feign client for organization-service.
 * <p>
 * Expected contract (to be implemented by organization-service):
 * {@code GET /api/organizations/for-user/{userId}} returning
 * {@code ApiResponse<PageResponse<OrganizationSummaryResponse>>}.
 */
@FeignClient(
        name = "organization-service",
        url = "${devflow.clients.organization-service-url:http://localhost:8083}",
        configuration = FeignClientConfig.class
)
public interface OrganizationClient {

    @GetMapping("/api/organizations/for-user/{userId}")
    ApiResponse<PageResponse<OrganizationSummaryResponse>> getOrganizationsForUser(@PathVariable("userId") UUID userId);
}

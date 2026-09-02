package com.devflow.sprint.client;

import com.devflow.common.api.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Resolves the JWT subject (Keycloak sub) to user-service's internal application user id.
 * Organization memberships (and therefore permission checks) are keyed by that internal id, not
 * the raw JWT subject — see {@link UserResponse}. Same contract as organization-service's
 * {@code CurrentUserResolver}/{@code UserClient}.
 */
@FeignClient(
        name = "user-service",
        url = "${devflow.clients.user-service-url:http://localhost:8082}",
        configuration = FeignClientConfig.class
)
public interface UserClient {

    @GetMapping("/api/users/by-external-id/{externalIdentityId}")
    ApiResponse<UserResponse> getByExternalId(@PathVariable("externalIdentityId") String externalIdentityId);

    @GetMapping("/api/users/me")
    ApiResponse<UserResponse> getMe();
}

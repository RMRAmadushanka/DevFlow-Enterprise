package com.devflow.organization.client;

import com.devflow.common.api.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

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

package com.devflow.organization.controller;

import com.devflow.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/organization")
@Tag(name = "organization-service")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Service health probe")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok(Map.of(
                "service", "organization-service",
                "status", "UP",
                "phase", "3-organization"
        ));
    }
}

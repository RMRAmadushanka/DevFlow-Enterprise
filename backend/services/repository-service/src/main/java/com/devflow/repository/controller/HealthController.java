package com.devflow.repository.controller;

import com.devflow.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/repository")
@Tag(name = "repository-service")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Service foundation health probe")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok(Map.of(
                "service", "repository-service",
                "status", "UP",
                "phase", "1-foundation"
        ));
    }
}

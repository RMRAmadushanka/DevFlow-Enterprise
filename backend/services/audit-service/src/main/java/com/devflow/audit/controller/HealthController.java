package com.devflow.audit.controller;

import com.devflow.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "audit-service")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Service foundation health probe")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok(Map.of(
                "service", "audit-service",
                "status", "UP",
                "phase", "1-foundation"
        ));
    }
}

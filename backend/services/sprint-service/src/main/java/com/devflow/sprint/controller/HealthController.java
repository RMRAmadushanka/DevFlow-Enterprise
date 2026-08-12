package com.devflow.sprint.controller;

import com.devflow.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/sprint")
@Tag(name = "sprint-service")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Service foundation health probe")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok(Map.of(
                "service", "sprint-service",
                "status", "UP",
                "phase", "1-foundation"
        ));
    }
}

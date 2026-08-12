package com.devflow.auth.controller;

import com.devflow.auth.dto.AuthSessionResponse;
import com.devflow.auth.service.SessionService;
import com.devflow.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Session")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/status")
    @Operation(
            summary = "Authentication status (public — returns authenticated=false when anonymous)",
            security = {}
    )
    public ApiResponse<AuthSessionResponse> status() {
        return ApiResponse.ok(sessionService.status());
    }
}

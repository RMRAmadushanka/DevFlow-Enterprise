package com.devflow.user.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.user.dto.UpdateUserPreferenceRequest;
import com.devflow.user.dto.UserPreferenceResponse;
import com.devflow.user.service.UserPreferenceService;
import com.devflow.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Preferences")
@SecurityRequirement(name = "bearerAuth")
public class UserPreferenceController {

    private final UserService userService;
    private final UserPreferenceService userPreferenceService;

    public UserPreferenceController(UserService userService, UserPreferenceService userPreferenceService) {
        this.userService = userService;
        this.userPreferenceService = userPreferenceService;
    }

    @GetMapping("/me/preferences")
    @Operation(summary = "Get current user preferences")
    public ApiResponse<UserPreferenceResponse> getPreferences() {
        userService.getOrCreateCurrentUser();
        return ApiResponse.ok(userPreferenceService.getCurrentPreferences());
    }

    @PatchMapping("/me/preferences")
    @Operation(summary = "Update current user preferences")
    public ApiResponse<UserPreferenceResponse> updatePreferences(
            @Valid @RequestBody UpdateUserPreferenceRequest request
    ) {
        userService.getOrCreateCurrentUser();
        return ApiResponse.ok(userPreferenceService.updateCurrentPreferences(request));
    }
}

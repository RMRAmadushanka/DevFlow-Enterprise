package com.devflow.user.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.user.dto.UpdateUserProfileRequest;
import com.devflow.user.dto.UserProfileResponse;
import com.devflow.user.service.UserProfileService;
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
@Tag(name = "User Profile")
@SecurityRequirement(name = "bearerAuth")
public class UserProfileController {

    private final UserService userService;
    private final UserProfileService userProfileService;

    public UserProfileController(UserService userService, UserProfileService userProfileService) {
        this.userService = userService;
        this.userProfileService = userProfileService;
    }

    @GetMapping("/me/profile")
    @Operation(summary = "Get current user profile")
    public ApiResponse<UserProfileResponse> getProfile() {
        userService.getOrCreateCurrentUser();
        return ApiResponse.ok(userProfileService.getCurrentProfile());
    }

    @PatchMapping("/me")
    @Operation(summary = "Update current user profile fields")
    public ApiResponse<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateUserProfileRequest request) {
        userService.getOrCreateCurrentUser();
        return ApiResponse.ok(userProfileService.updateCurrentProfile(request));
    }
}

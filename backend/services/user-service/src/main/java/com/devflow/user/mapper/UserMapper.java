package com.devflow.user.mapper;

import com.devflow.user.dto.CreateUserRequest;
import com.devflow.user.dto.UserPreferenceResponse;
import com.devflow.user.dto.UserProfileResponse;
import com.devflow.user.dto.UserResponse;
import com.devflow.user.entity.User;
import com.devflow.user.entity.UserStatus;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(CreateUserRequest request) {
        User user = new User();
        user.setExternalIdentityId(request.externalIdentityId());
        user.setUsername(blankToNull(request.username()));
        user.setEmail(blankToNull(request.email()));
        user.setFirstName(blankToNull(request.firstName()));
        user.setLastName(blankToNull(request.lastName()));
        user.setDisplayName(resolveDisplayName(request));
        user.setStatus(UserStatus.ACTIVE);
        user.setTheme("system");
        user.setNotifyEmail(true);
        user.setNotifyInApp(true);
        return user;
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getExternalIdentityId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getTimezone(),
                user.getLocale(),
                user.getStatus(),
                user.getTheme(),
                user.isNotifyEmail(),
                user.isNotifyInApp(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getExternalIdentityId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getTimezone(),
                user.getLocale()
        );
    }

    public UserPreferenceResponse toPreferenceResponse(User user) {
        return new UserPreferenceResponse(
                user.getId(),
                user.getTheme(),
                user.isNotifyEmail(),
                user.isNotifyInApp()
        );
    }

    private static String resolveDisplayName(CreateUserRequest request) {
        if (request.displayName() != null && !request.displayName().isBlank()) {
            return request.displayName().trim();
        }
        String first = request.firstName() == null ? "" : request.firstName().trim();
        String last = request.lastName() == null ? "" : request.lastName().trim();
        String combined = (first + " " + last).trim();
        if (!combined.isEmpty()) {
            return combined;
        }
        if (request.username() != null && !request.username().isBlank()) {
            return request.username().trim();
        }
        return null;
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}

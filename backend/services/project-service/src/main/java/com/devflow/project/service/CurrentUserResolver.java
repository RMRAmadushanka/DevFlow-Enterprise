package com.devflow.project.service;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.exception.UnauthorizedException;
import com.devflow.common.security.SecurityContextUtils;
import com.devflow.project.client.UserClient;
import com.devflow.project.client.UserResponse;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CurrentUserResolver {

    private final UserClient userClient;

    public CurrentUserResolver(UserClient userClient) {
        this.userClient = userClient;
    }

    public UserResponse requireCurrentUser() {
        String externalId = SecurityContextUtils.currentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        try {
            ApiResponse<UserResponse> response = userClient.getByExternalId(externalId);
            if (response == null || !response.success() || response.data() == null) {
                return requireMe();
            }
            return response.data();
        } catch (UnauthorizedException ex) {
            throw ex;
        } catch (Exception ex) {
            try {
                return requireMe();
            } catch (Exception ignored) {
                throw new UnauthorizedException("Unable to resolve application user for JWT subject");
            }
        }
    }

    public UUID requireCurrentUserId() {
        return requireCurrentUser().id();
    }

    private UserResponse requireMe() {
        ApiResponse<UserResponse> me = userClient.getMe();
        if (me == null || !me.success() || me.data() == null) {
            throw new UnauthorizedException("Unable to resolve application user for JWT subject");
        }
        return me.data();
    }
}

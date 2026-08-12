package com.devflow.auth.security;

import com.devflow.common.exception.UnauthorizedException;
import com.devflow.common.security.SecurityContextUtils;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SecurityContextService {

    public Optional<CurrentUser> findCurrentUser() {
        return SecurityContextUtils.currentJwt().map(this::toCurrentUser);
    }

    public CurrentUser requireCurrentUser() {
        return findCurrentUser()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
    }

    public boolean isAuthenticated() {
        return SecurityContextUtils.isAuthenticated() && SecurityContextUtils.currentJwt().isPresent();
    }

    public List<String> currentRoles() {
        return SecurityContextUtils.currentRoles();
    }

    private CurrentUser toCurrentUser(Jwt jwt) {
        String username = jwt.getClaimAsString("preferred_username");
        if (username == null || username.isBlank()) {
            username = jwt.getClaimAsString("email");
        }
        Boolean verified = jwt.getClaimAsBoolean("email_verified");
        return new CurrentUser(
                jwt.getSubject(),
                username,
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("given_name"),
                jwt.getClaimAsString("family_name"),
                SecurityContextUtils.currentRoles(),
                Boolean.TRUE.equals(verified)
        );
    }
}

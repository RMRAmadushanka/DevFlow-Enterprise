package com.devflow.auth.service;

import com.devflow.auth.dto.AuthSessionResponse;
import com.devflow.auth.security.CurrentUser;
import com.devflow.auth.security.SecurityContextService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SessionService {

    private final SecurityContextService securityContextService;

    public SessionService(SecurityContextService securityContextService) {
        this.securityContextService = securityContextService;
    }

    public AuthSessionResponse status() {
        if (!securityContextService.isAuthenticated()) {
            return new AuthSessionResponse(false, null, null, List.of());
        }
        CurrentUser user = securityContextService.requireCurrentUser();
        return new AuthSessionResponse(true, user.id(), user.username(), user.roles());
    }
}

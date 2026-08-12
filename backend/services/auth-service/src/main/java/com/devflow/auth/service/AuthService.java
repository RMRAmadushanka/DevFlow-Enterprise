package com.devflow.auth.service;

import com.devflow.auth.dto.CurrentUserResponse;
import com.devflow.auth.dto.LogoutResponse;
import com.devflow.auth.events.AuthEventPublisher;
import com.devflow.auth.events.AuthEventType;
import com.devflow.auth.integration.UserProfileService;
import com.devflow.auth.security.CurrentUser;
import com.devflow.auth.security.SecurityContextService;
import com.devflow.auth.config.KeycloakProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final SecurityContextService securityContextService;
    private final KeycloakService keycloakService;
    private final KeycloakProperties keycloakProperties;
    private final AuthEventPublisher authEventPublisher;
    private final UserProfileService userProfileService;

    public AuthService(
            SecurityContextService securityContextService,
            KeycloakService keycloakService,
            KeycloakProperties keycloakProperties,
            AuthEventPublisher authEventPublisher,
            UserProfileService userProfileService
    ) {
        this.securityContextService = securityContextService;
        this.keycloakService = keycloakService;
        this.keycloakProperties = keycloakProperties;
        this.authEventPublisher = authEventPublisher;
        this.userProfileService = userProfileService;
    }

    public CurrentUserResponse currentUser() {
        CurrentUser user = securityContextService.requireCurrentUser();
        userProfileService.ensureProfileExists(user.id(), user.email(), user.username());
        authEventPublisher.publish(AuthEventType.USER_AUTHENTICATED, user.id(), Map.of(
                "email", nullToEmpty(user.email()),
                "username", nullToEmpty(user.username()),
                "firstName", nullToEmpty(user.firstName()),
                "lastName", nullToEmpty(user.lastName())
        ));
        log.info("eventType=USER_AUTHENTICATED userId={} result=ok", user.id());
        return toResponse(user);
    }

    public LogoutResponse logout(String idTokenHint) {
        CurrentUser user = securityContextService.requireCurrentUser();
        String redirect = keycloakProperties.frontendUrl() != null
                ? keycloakProperties.frontendUrl()
                : "http://localhost:3000";
        String logoutUrl = keycloakService.buildLogoutUrl(idTokenHint, redirect);
        authEventPublisher.publish(AuthEventType.USER_LOGOUT, user.id());
        log.info("eventType=USER_LOGOUT userId={} result=ok", user.id());
        return new LogoutResponse(
                true,
                "Clear local tokens and redirect the browser to keycloakLogoutUrl to end the Keycloak SSO session.",
                logoutUrl
        );
    }

    private static CurrentUserResponse toResponse(CurrentUser user) {
        return new CurrentUserResponse(
                user.id(),
                user.username(),
                user.email(),
                user.firstName(),
                user.lastName(),
                user.roles(),
                user.emailVerified()
        );
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}

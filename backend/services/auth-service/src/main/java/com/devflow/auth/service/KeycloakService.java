package com.devflow.auth.service;

import com.devflow.auth.config.KeycloakProperties;
import com.devflow.auth.exception.AuthException;
import com.devflow.common.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Keycloak integration boundary.
 * <p>
 * Admin operations are intentionally not exposed to the frontend.
 * Credentials never leave server-side configuration.
 */
@Service
public class KeycloakService {

    private static final Logger log = LoggerFactory.getLogger(KeycloakService.class);

    private final KeycloakProperties properties;
    private final RestClient.Builder restClientBuilder;

    public KeycloakService(KeycloakProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClientBuilder = restClientBuilder;
    }

    public String buildLogoutUrl(String idTokenHint, String postLogoutRedirectUri) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl(realmBase() + "/protocol/openid-connect/logout");
        if (postLogoutRedirectUri != null && !postLogoutRedirectUri.isBlank()) {
            builder.queryParam("post_logout_redirect_uri", postLogoutRedirectUri);
            builder.queryParam("client_id", properties.webClientId());
        }
        if (idTokenHint != null && !idTokenHint.isBlank()) {
            builder.queryParam("id_token_hint", idTokenHint);
        }
        return builder.build(true).toUriString();
    }

    public String issuerUri() {
        return realmBase();
    }

    public String authorizationEndpoint() {
        return realmBase() + "/protocol/openid-connect/auth";
    }

    public String tokenEndpoint() {
        return realmBase() + "/protocol/openid-connect/token";
    }

    public String jwksUri() {
        return realmBase() + "/protocol/openid-connect/certs";
    }

    /**
     * Future admin op — create user via Keycloak Admin API.
     * Not called by public controllers in Phase 2.
     */
    public void createUser(String username, String email, String temporaryPassword) {
        requireAdminApi();
        String token = fetchAdminAccessToken();
        Map<String, Object> body = Map.of(
                "username", username,
                "email", email,
                "enabled", true,
                "emailVerified", false,
                "credentials", List.of(Map.of(
                        "type", "password",
                        "value", temporaryPassword,
                        "temporary", true
                ))
        );
        restClientBuilder.build()
                .post()
                .uri(adminBase() + "/users")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + token)
                .body(body)
                .retrieve()
                .toBodilessEntity();
        log.info("eventType=KEYCLOAK_USER_CREATE username={} result=ok", username);
    }

    public void setUserEnabled(String keycloakUserId, boolean enabled) {
        requireAdminApi();
        String token = fetchAdminAccessToken();
        restClientBuilder.build()
                .put()
                .uri(adminBase() + "/users/{id}", keycloakUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + token)
                .body(Map.of("enabled", enabled))
                .retrieve()
                .toBodilessEntity();
        log.info("eventType=KEYCLOAK_USER_ENABLED userId={} enabled={} result=ok", keycloakUserId, enabled);
    }

    public void assignRealmRole(String keycloakUserId, String roleName) {
        requireAdminApi();
        // Role lookup + mapping is completed when admin API is fully wired in a later hardening pass.
        log.info("eventType=KEYCLOAK_ROLE_ASSIGN userId={} role={} result=boundary_ready",
                keycloakUserId, roleName);
    }

    private void requireAdminApi() {
        if (!properties.adminApiEnabled()) {
            throw new AuthException(ErrorCode.SERVICE_UNAVAILABLE,
                    "Keycloak Admin API is disabled", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @SuppressWarnings("unchecked")
    private String fetchAdminAccessToken() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", properties.adminClientId());
        form.add("client_secret", properties.adminClientSecret());

        Map<String, Object> response = restClientBuilder.build()
                .post()
                .uri(tokenEndpoint())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("access_token") == null) {
            throw new AuthException(ErrorCode.SERVICE_UNAVAILABLE,
                    "Unable to obtain Keycloak admin token", HttpStatus.SERVICE_UNAVAILABLE);
        }
        return response.get("access_token").toString();
    }

    private String realmBase() {
        return trimSlash(properties.serverUrl()) + "/realms/" + properties.realm();
    }

    private String adminBase() {
        return trimSlash(properties.serverUrl()) + "/admin/realms/" + properties.realm();
    }

    private static String trimSlash(String value) {
        if (value == null) {
            return "";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    @SuppressWarnings("unused")
    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}

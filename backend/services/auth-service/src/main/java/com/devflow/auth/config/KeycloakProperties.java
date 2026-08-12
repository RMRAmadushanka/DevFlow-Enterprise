package com.devflow.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "devflow.keycloak")
public record KeycloakProperties(
        String serverUrl,
        String realm,
        String adminClientId,
        String adminClientSecret,
        String webClientId,
        String frontendUrl,
        boolean adminApiEnabled
) {
}

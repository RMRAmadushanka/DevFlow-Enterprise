package com.devflow.common.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/**
 * Shared Keycloak JWT → Spring Security authentication converter.
 */
public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final JwtRoleConverter roleConverter;

    public KeycloakJwtAuthenticationConverter() {
        this(null);
    }

    public KeycloakJwtAuthenticationConverter(String clientId) {
        this.roleConverter = new JwtRoleConverter(clientId);
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        return new JwtAuthenticationToken(jwt, roleConverter.convert(jwt), jwt.getSubject());
    }
}

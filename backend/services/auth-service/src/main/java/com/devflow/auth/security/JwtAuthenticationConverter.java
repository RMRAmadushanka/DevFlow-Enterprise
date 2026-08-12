package com.devflow.auth.security;

import com.devflow.common.security.JwtRoleConverter;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public class JwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final JwtRoleConverter roleConverter;

    public JwtAuthenticationConverter(String clientId) {
        this.roleConverter = new JwtRoleConverter(clientId);
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        return new JwtAuthenticationToken(jwt, roleConverter.convert(jwt), jwt.getSubject());
    }
}

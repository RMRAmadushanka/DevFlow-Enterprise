package com.devflow.common.security;

import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

/**
 * Builds JWT validators for Keycloak resource servers.
 * Always validates issuer (+ default exp/nbf). Audience is optional — Keycloak access
 * tokens often use {@code aud=account}; enable only when realm mappers emit a known audience.
 */
public final class KeycloakJwtValidators {

    private KeycloakJwtValidators() {
    }

    public static OAuth2TokenValidator<Jwt> forIssuer(String issuerUri) {
        return JwtValidators.createDefaultWithIssuer(issuerUri);
    }

    /**
     * @param issuerUri Keycloak realm issuer
     * @param audiencesCsv comma-separated accepted {@code aud} values; blank = no audience check
     */
    public static OAuth2TokenValidator<Jwt> forIssuerAndOptionalAudiences(
            String issuerUri,
            String audiencesCsv
    ) {
        OAuth2TokenValidator<Jwt> issuer = forIssuer(issuerUri);
        List<String> audiences = parseAudiences(audiencesCsv);
        if (audiences.isEmpty()) {
            return issuer;
        }
        return new DelegatingOAuth2TokenValidator<>(issuer, new AudienceValidator(audiences));
    }

    private static List<String> parseAudiences(String audiencesCsv) {
        if (!StringUtils.hasText(audiencesCsv)) {
            return List.of();
        }
        return Arrays.stream(audiencesCsv.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();
    }

    static final class AudienceValidator implements OAuth2TokenValidator<Jwt> {
        private final List<String> expected;

        AudienceValidator(List<String> expected) {
            this.expected = List.copyOf(expected);
        }

        @Override
        public OAuth2TokenValidatorResult validate(Jwt token) {
            Object aud = token.getAudience();
            if (aud instanceof Collection<?> collection) {
                boolean match = collection.stream()
                        .filter(Objects::nonNull)
                        .map(Object::toString)
                        .anyMatch(expected::contains);
                if (match) {
                    return OAuth2TokenValidatorResult.success();
                }
            } else if (aud != null && expected.contains(aud.toString())) {
                return OAuth2TokenValidatorResult.success();
            }
            // Also accept azp when realm uses authorized-party instead of aud for SPA clients
            String azp = token.getClaimAsString("azp");
            if (azp != null && expected.contains(azp)) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Required audience is missing", null));
        }
    }
}

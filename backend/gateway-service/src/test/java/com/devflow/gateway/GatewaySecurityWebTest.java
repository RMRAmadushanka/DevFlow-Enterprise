package com.devflow.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Map;

@SpringBootTest
@AutoConfigureWebTestClient
@Import(GatewaySecurityWebTest.TestJwtConfig.class)
@TestPropertySource(properties = {
        "spring.cloud.gateway.default-filters=",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration",
        "management.health.redis.enabled=false",
        "devflow.cors.allowed-origins=http://localhost:3000",
        "devflow.gateway.rate-limiter.enabled=false"
})
class GatewaySecurityWebTest {

    @Autowired
    private WebTestClient webTestClient;

    @TestConfiguration
    static class TestJwtConfig {
        @Bean
        ReactiveJwtDecoder reactiveJwtDecoder() {
            return token -> {
                if ("valid-token".equals(token)) {
                    return Mono.just(new Jwt(
                            token,
                            Instant.now(),
                            Instant.now().plusSeconds(3600),
                            Map.of("alg", "none"),
                            Map.of(
                                    "sub", "kc-sub-1",
                                    "preferred_username", "developer",
                                    "email", "developer@devflow.local",
                                    "iss", "http://localhost:8180/realms/devflow"
                            )
                    ));
                }
                return Mono.error(new BadJwtException("invalid token"));
            };
        }
    }

    @Test
    void authStatusIsPublic() {
        webTestClient.get()
                .uri("/api/auth/status")
                .exchange()
                .expectStatus().value(status -> {
                    if (status == HttpStatus.UNAUTHORIZED.value()) {
                        throw new AssertionError("Public /api/auth/status must not require JWT");
                    }
                });
    }

    @Test
    void protectedRouteWithoutJwtReturnsUnauthorized() {
        webTestClient.get()
                .uri("/api/users/me")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void protectedRouteWithInvalidJwtReturnsUnauthorized() {
        webTestClient.get()
                .uri("/api/users/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer not-a-jwt")
                .exchange()
                .expectStatus().isUnauthorized();
    }
}

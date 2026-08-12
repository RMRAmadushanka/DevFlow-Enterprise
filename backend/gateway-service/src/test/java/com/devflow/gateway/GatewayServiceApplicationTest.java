package com.devflow.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.test.context.TestPropertySource;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Map;

@SpringBootTest
@Import(GatewayServiceApplicationTest.TestJwtConfig.class)
@TestPropertySource(properties = {
        "spring.cloud.gateway.default-filters=",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration"
})
class GatewayServiceApplicationTest {

    @TestConfiguration
    static class TestJwtConfig {
        @Bean
        ReactiveJwtDecoder reactiveJwtDecoder() {
            return token -> Mono.just(
                    new Jwt(
                            token,
                            Instant.now(),
                            Instant.now().plusSeconds(3600),
                            Map.of("alg", "none"),
                            Map.of("sub", "test-user")
                    )
            );
        }
    }

    @Test
    void contextLoads() {
        // Foundation smoke test — context wiring only.
    }
}

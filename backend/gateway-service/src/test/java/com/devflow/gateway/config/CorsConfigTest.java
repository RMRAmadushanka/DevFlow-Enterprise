package com.devflow.gateway.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CorsConfigTest {

    @Test
    void allowsConfiguredOriginAndRejectsWildcard() {
        CorsConfig config = new CorsConfig();
        CorsConfigurationSource source = config.corsConfigurationSource(
                "http://localhost:3000, * , https://app.example.com");

        ServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("http://localhost:8080/api/users/me")
                        .header("Origin", "http://localhost:3000")
                        .build());

        CorsConfiguration cors = source.getCorsConfiguration(exchange);
        assertNotNull(cors);
        assertTrue(cors.getAllowedOrigins().contains("http://localhost:3000"));
        assertTrue(cors.getAllowedOrigins().contains("https://app.example.com"));
        assertFalse(cors.getAllowedOrigins().contains("*"));
        assertTrue(Boolean.TRUE.equals(cors.getAllowCredentials()));
        assertTrue(cors.getAllowedHeaders().contains("Authorization"));
        assertTrue(source instanceof UrlBasedCorsConfigurationSource);
    }
}

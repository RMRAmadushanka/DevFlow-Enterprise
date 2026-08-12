package com.devflow.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Preserves the inbound Authorization header and adds derived identity headers for downstream services.
 * Downstream services must still validate JWTs independently.
 */
@Component
public class AuthenticationHeaderRelayFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> ctx.getAuthentication())
                .filter(JwtAuthenticationToken.class::isInstance)
                .cast(JwtAuthenticationToken.class)
                .flatMap(token -> {
                    Jwt jwt = token.getToken();
                    var builder = exchange.getRequest().mutate()
                            .header("X-User-Id", jwt.getSubject());
                    if (jwt.hasClaim("email")) {
                        builder.header("X-User-Email", jwt.getClaimAsString("email"));
                    }
                    // Keep original Authorization if present; otherwise reconstruct from validated JWT.
                    if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                        builder.header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.getTokenValue());
                    }
                    return chain.filter(exchange.mutate().request(builder.build()).build());
                })
                .switchIfEmpty(chain.filter(exchange));
    }

    @Override
    public int getOrder() {
        return -50;
    }
}

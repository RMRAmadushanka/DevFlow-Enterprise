package com.devflow.gateway.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimiterConfig {

    @Bean
    KeyResolver ipKeyResolver() {
        return exchange -> {
            var remote = exchange.getRequest().getRemoteAddress();
            if (remote == null || remote.getAddress() == null) {
                return Mono.just("unknown");
            }
            return Mono.just(remote.getAddress().getHostAddress());
        };
    }

    @Bean
    @ConditionalOnProperty(name = "devflow.gateway.rate-limiter.enabled", havingValue = "true")
    RedisRateLimiter redisRateLimiter() {
        return new RedisRateLimiter(50, 100);
    }
}

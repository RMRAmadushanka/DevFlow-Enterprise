package com.devflow.project.client;

import com.devflow.common.api.CorrelationIdHolder;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Relays Authorization and X-Correlation-Id to user/org Feign calls (same pattern as org-service).
 */
public class FeignClientConfig {

    @Bean
    public RequestInterceptor authorizationRelayInterceptor() {
        return template -> {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                String authorization = attrs.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
                if (authorization != null && !authorization.isBlank()) {
                    template.header(HttpHeaders.AUTHORIZATION, authorization);
                }
            }

            String correlationId = CorrelationIdHolder.get();
            if ((correlationId == null || correlationId.isBlank()) && attrs != null) {
                correlationId = attrs.getRequest().getHeader(CorrelationIdHolder.HEADER);
            }
            if (correlationId != null && !correlationId.isBlank()) {
                template.header(CorrelationIdHolder.HEADER, correlationId);
            }
        };
    }
}

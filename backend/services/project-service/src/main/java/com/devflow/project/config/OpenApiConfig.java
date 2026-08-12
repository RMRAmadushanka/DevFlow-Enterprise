package com.devflow.project.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        final String scheme = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("DevFlow project-service")
                        .description("""
                                Phase 4 — projects, members, settings, tags, favorites, activity, outbox.

                                Authenticate with a Keycloak JWT (`Authorization: Bearer <token>`).
                                Actor identity is resolved from JWT `sub` → user-service; never trust
                                client-supplied userId/role for authorization.
                                """)
                        .version("0.4.0"))
                .addSecurityItem(new SecurityRequirement().addList(scheme))
                .components(new Components().addSecuritySchemes(scheme,
                        new SecurityScheme()
                                .name(scheme)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Keycloak access token (OAuth2 Resource Server)")));
    }
}

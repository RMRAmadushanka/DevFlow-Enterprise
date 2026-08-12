# Scaffolds a Spring Boot microservice template for DevFlow Phase 1.
param(
    [Parameter(Mandatory = $true)][string]$ServiceName,   # e.g. auth-service
    [Parameter(Mandatory = $true)][string]$PackageName,   # e.g. auth
    [Parameter(Mandatory = $true)][int]$Port,
    [switch]$UseMongo,
    [switch]$SkipPostgres
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Base = Join-Path $Root "services\$ServiceName"
$PkgRoot = Join-Path $Base "src\main\java\com\devflow\$PackageName"
$ResRoot = Join-Path $Base "src\main\resources"
$TestRoot = Join-Path $Base "src\test\java\com\devflow\$PackageName"
$AppClass = (Get-Culture).TextInfo.ToTitleCase($PackageName) -replace '-', ''
$AppClass = ($PackageName.Substring(0,1).ToUpper() + $PackageName.Substring(1)) + "ServiceApplication"

$folders = @(
    "controller", "service", "repository", "entity", "dto", "mapper",
    "exception", "config", "security", "util"
) | ForEach-Object { Join-Path $PkgRoot $_ }

foreach ($f in @($PkgRoot, $ResRoot, $TestRoot) + $folders + @(
    (Join-Path $ResRoot "db\migration"),
    (Join-Path $Base "src\test\resources"),
    (Join-Path $TestRoot "controller")
)) {
    New-Item -ItemType Directory -Force -Path $f | Out-Null
}

# package-info placeholders so empty packages are kept
foreach ($folder in $folders) {
    $pkg = "com.devflow.$PackageName." + (Split-Path $folder -Leaf)
    Set-Content -Path (Join-Path $folder "package-info.java") -Encoding utf8 -Value @"
/**
 * Phase 1 foundation package — business logic will be added in later phases.
 */
package $pkg;
"@
}

$pomDeps = @"
        <dependency>
            <groupId>com.devflow</groupId>
            <artifactId>common-library</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        </dependency>
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
        </dependency>
"@

if (-not $SkipPostgres) {
    $pomDeps += @"

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>
"@
}

if ($UseMongo) {
    $pomDeps += @"

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>
"@
}

$pomDeps += @"

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka-test</artifactId>
            <scope>test</scope>
        </dependency>
"@

Set-Content -Path (Join-Path $Base "pom.xml") -Encoding utf8 -Value @"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.devflow</groupId>
        <artifactId>devflow-backend</artifactId>
        <version>0.1.0-SNAPSHOT</version>
        <relativePath>../../pom.xml</relativePath>
    </parent>

    <artifactId>$ServiceName</artifactId>
    <name>DevFlow $ServiceName</name>
    <description>Phase 1 foundation for $ServiceName</description>

    <dependencies>
$pomDeps
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
"@

Set-Content -Path (Join-Path $PkgRoot "$AppClass.java") -Encoding utf8 -Value @"
package com.devflow.$PackageName;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class $AppClass {

    public static void main(String[] args) {
        SpringApplication.run($AppClass.class, args);
    }
}
"@

Set-Content -Path (Join-Path $PkgRoot "controller\HealthController.java") -Encoding utf8 -Value @"
package com.devflow.$PackageName.controller;

import com.devflow.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/$PackageName")
@Tag(name = "$ServiceName")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Service foundation health probe")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok(Map.of(
                "service", "$ServiceName",
                "status", "UP",
                "phase", "1-foundation"
        ));
    }
}
"@

Set-Content -Path (Join-Path $PkgRoot "config\OpenApiConfig.java") -Encoding utf8 -Value @"
package com.devflow.$PackageName.config;

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
                        .title("DevFlow $ServiceName")
                        .description("Phase 1 foundation — no business features yet")
                        .version("0.1.0"))
                .addSecurityItem(new SecurityRequirement().addList(scheme))
                .components(new Components().addSecuritySchemes(scheme,
                        new SecurityScheme()
                                .name(scheme)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
"@

Set-Content -Path (Join-Path $PkgRoot "config\SecurityConfig.java") -Encoding utf8 -Value @"
package com.devflow.$PackageName.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/info",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api/v1/$PackageName/health"
                        ).permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter())));
        return http.build();
    }

    private Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthConverter() {
        JwtGrantedAuthoritiesConverter granted = new JwtGrantedAuthoritiesConverter();
        granted.setAuthoritiesClaimName("realm_access.roles");
        granted.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            // Realm roles are nested; foundation converter — refined in auth phase.
            var roles = jwt.getClaimAsMap("realm_access");
            if (roles != null && roles.get("roles") instanceof java.util.Collection<?> collection) {
                return collection.stream()
                        .map(Object::toString)
                        .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role))
                        .map(org.springframework.security.core.GrantedAuthority.class::cast)
                        .toList();
            }
            return granted.convert(jwt);
        });
        return converter;
    }
}
"@

Set-Content -Path (Join-Path $PkgRoot "config\KafkaTopicsConfig.java") -Encoding utf8 -Value @"
package com.devflow.$PackageName.config;

import com.devflow.common.constant.KafkaTopics;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Ensures foundation topics exist when the service starts (idempotent).
 */
@Configuration
public class KafkaTopicsConfig {

    @Bean
    NewTopic userEventsTopic() {
        return TopicBuilder.name(KafkaTopics.USER_EVENTS).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic projectEventsTopic() {
        return TopicBuilder.name(KafkaTopics.PROJECT_EVENTS).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic taskEventsTopic() {
        return TopicBuilder.name(KafkaTopics.TASK_EVENTS).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic notificationEventsTopic() {
        return TopicBuilder.name(KafkaTopics.NOTIFICATION_EVENTS).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic auditEventsTopic() {
        return TopicBuilder.name(KafkaTopics.AUDIT_EVENTS).partitions(3).replicas(1).build();
    }
}
"@

Set-Content -Path (Join-Path $PkgRoot "config\RedisConfig.java") -Encoding utf8 -Value @"
package com.devflow.$PackageName.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

@Configuration
public class RedisConfig {

    @Bean
    StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }
}
"@

Set-Content -Path (Join-Path $PkgRoot "security\SecurityUtils.java") -Encoding utf8 -Value @"
package com.devflow.$PackageName.security;

import com.devflow.common.security.SecurityContextUtils;

/**
 * Service-local facade over shared security helpers.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static String currentUserId() {
        return SecurityContextUtils.currentUserId().orElse(null);
    }
}
"@

$dbName = $PackageName.Replace("-", "_")
$jpaBlock = if (-not $SkipPostgres) { @"

  datasource:
    url: `${DB_URL:jdbc:postgresql://localhost:5432/devflow_$dbName}
    username: `${DB_USERNAME:devflow}
    password: `${DB_PASSWORD:devflow}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
    properties:
      hibernate:
        jdbc:
          time_zone: UTC
  flyway:
    enabled: true
    locations: classpath:db/migration
"@ } else { "" }

$mongoBlock = if ($UseMongo) { @"

  data:
    mongodb:
      uri: `${MONGODB_URI:mongodb://devflow:devflow@localhost:27017/devflow_$dbName?authSource=admin}
"@ } else { "" }

# Fix yaml nesting for spring.data when both redis and mongo - use careful structure
Set-Content -Path (Join-Path $ResRoot "application.yml") -Encoding utf8 -Value @"
spring:
  application:
    name: $ServiceName
  profiles:
    default: local
  jackson:
    serialization:
      write-dates-as-timestamps: false
$jpaBlock
  data:
    redis:
      host: `${REDIS_HOST:localhost}
      port: `${REDIS_PORT:6379}
      password: `${REDIS_PASSWORD:}
$(if ($UseMongo) { "    mongodb:`n      uri: `${MONGODB_URI:mongodb://devflow:devflow@localhost:27017/devflow_${dbName}?authSource=admin}" } else { "" })
  kafka:
    admin:
      fail-fast: false
    bootstrap-servers: `${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    consumer:
      group-id: $ServiceName
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: `${KEYCLOAK_ISSUER_URI:http://localhost:8180/realms/devflow}
          jwk-set-uri: `${KEYCLOAK_JWK_SET_URI:http://localhost:8180/realms/devflow/protocol/openid-connect/certs}

server:
  port: $Port

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when_authorized

springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html

logging:
  level:
    root: INFO
    com.devflow: DEBUG
  pattern:
    level: "%5p [corr=%X{correlationId}]"
"@

Set-Content -Path (Join-Path $ResRoot "application-local.yml") -Encoding utf8 -Value @"
# Local developer overrides (no Docker network DNS)
spring:
  config:
    activate:
      on-profile: local
"@

$dockerYaml = @"
spring:
  config:
    activate:
      on-profile: docker
  data:
    redis:
      host: redis
"@
if ($UseMongo) {
    $dockerYaml += @"

    mongodb:
      uri: mongodb://devflow:devflow@mongo:27017/devflow_${dbName}?authSource=admin
"@
}
$dockerYaml += @"

  kafka:
    bootstrap-servers: kafka:9092
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://keycloak:8080/realms/devflow
          jwk-set-uri: http://keycloak:8080/realms/devflow/protocol/openid-connect/certs
"@
if (-not $SkipPostgres) {
    $dockerYaml += @"

  datasource:
    url: jdbc:postgresql://postgres:5432/devflow_${dbName}
"@
}
Set-Content -Path (Join-Path $ResRoot "application-docker.yml") -Encoding utf8 -Value $dockerYaml

if (-not $SkipPostgres) {
    Set-Content -Path (Join-Path $ResRoot "db\migration\V1__initial.sql") -Encoding utf8 -Value @"
-- Phase 1 foundation schema for $ServiceName
-- Business tables will be added in later phases.

CREATE TABLE IF NOT EXISTS schema_foundation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO schema_foundation (service_name)
SELECT '$ServiceName'
WHERE NOT EXISTS (
    SELECT 1 FROM schema_foundation WHERE service_name = '$ServiceName'
);
"@
}

Set-Content -Path (Join-Path $ResRoot "logback-spring.xml") -Encoding utf8 -Value @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
    <springProperty name="APP_NAME" source="spring.application.name" defaultValue="$ServiceName"/>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{ISO8601} %5p [${APP_NAME}] [corr=%X{correlationId}] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>
"@

Set-Content -Path (Join-Path $TestRoot "controller\HealthControllerTest.java") -Encoding utf8 -Value @"
package com.devflow.$PackageName.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = HealthController.class)
@AutoConfigureMockMvc(addFilters = false)
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthReturnsFoundationStatus() throws Exception {
        mockMvc.perform(get("/api/v1/$PackageName/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.service").value("$ServiceName"));
    }
}
"@

Set-Content -Path (Join-Path $Base "Dockerfile") -Encoding utf8 -Value @"
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
ARG JAR_FILE=target/$ServiceName-0.1.0-SNAPSHOT.jar
COPY `${JAR_FILE} app.jar
EXPOSE $Port
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java `$JAVA_OPTS -jar /app/app.jar"]
"@

Write-Output "Scaffolded $ServiceName on port $Port"

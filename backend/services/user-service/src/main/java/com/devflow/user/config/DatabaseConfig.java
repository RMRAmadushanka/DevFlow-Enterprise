package com.devflow.user.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA configuration. Timestamps are managed by {@link com.devflow.common.entity.BaseEntity};
 * auditing is enabled for future audited fields.
 */
@Configuration
@EnableJpaAuditing
public class DatabaseConfig {
}

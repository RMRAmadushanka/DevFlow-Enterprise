package com.devflow.common.config;

import com.devflow.common.exception.GlobalExceptionHandler;
import com.devflow.common.logging.CorrelationIdFilter;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Import;

@AutoConfiguration
@ConditionalOnWebApplication
@Import({GlobalExceptionHandler.class, CorrelationIdFilter.class})
public class CommonAutoConfiguration {
}

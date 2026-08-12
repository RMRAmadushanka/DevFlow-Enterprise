package com.devflow.auth.exception;

/**
 * Auth-service uses {@link com.devflow.common.exception.GlobalExceptionHandler}
 * from common-library auto-configuration for the standard {@code ApiResponse} error envelope.
 * <p>
 * Security filter-chain errors (401/403) are handled in {@link com.devflow.auth.config.SecurityConfig}
 * so they never leak token details.
 * <p>
 * Domain errors should throw {@link AuthException} (or other {@code DevFlowException} subtypes).
 */
public final class GlobalExceptionHandler {

    private GlobalExceptionHandler() {
    }
}

package com.devflow.common.event;

import com.devflow.common.api.CorrelationIdHolder;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Phase 3+ Kafka event envelope.
 * Never include passwords, JWTs, refresh tokens, or secrets in payload.
 */
public record EventEnvelope(
        String eventId,
        String eventType,
        String aggregateType,
        String aggregateId,
        String timestamp,
        String source,
        int version,
        String correlationId,
        Map<String, Object> payload
) {

    public static EventEnvelope of(
            String eventType,
            String aggregateType,
            String aggregateId,
            String source,
            Map<String, Object> payload
    ) {
        return of(eventType, aggregateType, aggregateId, source, payload, CorrelationIdHolder.get());
    }

    /**
     * Prefer this overload when publishing asynchronously (e.g. outbox poller) so the
     * request-scoped correlation id captured at enqueue time is preserved.
     */
    public static EventEnvelope of(
            String eventType,
            String aggregateType,
            String aggregateId,
            String source,
            Map<String, Object> payload,
            String correlationId
    ) {
        String resolvedCorrelationId = correlationId;
        if (resolvedCorrelationId == null || resolvedCorrelationId.isBlank()) {
            resolvedCorrelationId = CorrelationIdHolder.get();
        }
        if (resolvedCorrelationId == null || resolvedCorrelationId.isBlank()) {
            resolvedCorrelationId = UUID.randomUUID().toString();
        }
        return new EventEnvelope(
                UUID.randomUUID().toString(),
                eventType,
                aggregateType,
                aggregateId,
                Instant.now().toString(),
                source,
                1,
                resolvedCorrelationId,
                payload == null ? Map.of() : payload
        );
    }
}

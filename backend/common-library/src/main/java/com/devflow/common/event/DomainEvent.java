package com.devflow.common.event;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Envelope for Kafka domain events (payload filled in later phases).
 */
public record DomainEvent(
        UUID id,
        String type,
        Instant occurredAt,
        String organizationId,
        String actorId,
        String correlationId,
        Map<String, Object> payload
) {

    public static DomainEvent of(String type, String organizationId, String actorId, Map<String, Object> payload) {
        return new DomainEvent(
                UUID.randomUUID(),
                type,
                Instant.now(),
                organizationId,
                actorId,
                com.devflow.common.api.CorrelationIdHolder.get(),
                payload
        );
    }
}

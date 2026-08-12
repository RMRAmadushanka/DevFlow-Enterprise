package com.devflow.common.event;

import com.devflow.common.api.CorrelationIdHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class EventEnvelopeTest {

    @AfterEach
    void clear() {
        CorrelationIdHolder.clear();
    }

    @Test
    void ofUsesExplicitCorrelationIdOverThreadLocal() {
        CorrelationIdHolder.set("from-mdc");
        EventEnvelope envelope = EventEnvelope.of(
                "PROJECT_CREATED",
                "Project",
                "agg-1",
                "project-service",
                Map.of("projectId", "agg-1"),
                "from-outbox"
        );
        assertEquals("from-outbox", envelope.correlationId());
        assertNotNull(envelope.eventId());
        assertFalse(envelope.eventId().isBlank());
        assertEquals(1, envelope.version());
        assertFalse(envelope.payload().containsKey("password"));
        assertFalse(envelope.payload().containsKey("jwt"));
    }

    @Test
    void ofGeneratesCorrelationIdWhenMissing() {
        EventEnvelope envelope = EventEnvelope.of(
                "PROJECT_UPDATED",
                "Project",
                "agg-1",
                "project-service",
                Map.of(),
                null
        );
        assertNotNull(envelope.correlationId());
        assertFalse(envelope.correlationId().isBlank());
    }
}

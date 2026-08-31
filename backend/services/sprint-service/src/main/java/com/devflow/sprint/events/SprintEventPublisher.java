package com.devflow.sprint.events;

import com.devflow.sprint.service.OutboxService;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Domain-facing publisher that writes to the transactional outbox (not Kafka directly).
 */
@Component
public class SprintEventPublisher {

    private final OutboxService outboxService;

    public SprintEventPublisher(OutboxService outboxService) {
        this.outboxService = outboxService;
    }

    public void publish(SprintEventType type, String aggregateId, Map<String, Object> payload) {
        outboxService.enqueue(type, aggregateId, payload);
    }
}

package com.devflow.project.events;

import com.devflow.project.service.OutboxService;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Domain-facing publisher that writes to the transactional outbox (not Kafka directly).
 */
@Component
public class ProjectEventPublisher {

    private final OutboxService outboxService;

    public ProjectEventPublisher(OutboxService outboxService) {
        this.outboxService = outboxService;
    }

    public void publish(ProjectEventType type, String aggregateId, Map<String, Object> payload) {
        outboxService.enqueue(type, aggregateId, payload);
    }
}

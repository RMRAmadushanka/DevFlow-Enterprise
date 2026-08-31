package com.devflow.task.events;

import com.devflow.task.service.OutboxService;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Domain-facing publisher that writes to the transactional outbox (not Kafka directly).
 */
@Component
public class TaskEventPublisher {

    private final OutboxService outboxService;

    public TaskEventPublisher(OutboxService outboxService) {
        this.outboxService = outboxService;
    }

    public void publish(TaskEventType type, String aggregateId, Map<String, Object> payload) {
        outboxService.enqueue(type, aggregateId, payload);
    }
}

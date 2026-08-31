package com.devflow.sprint.service;

import com.devflow.common.api.CorrelationIdHolder;
import com.devflow.sprint.entity.OutboxEvent;
import com.devflow.sprint.entity.OutboxStatus;
import com.devflow.sprint.events.SprintEventType;
import com.devflow.sprint.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Writes outbox rows in the caller transaction so domain changes and event intent commit atomically.
 * Actual Kafka publish is performed asynchronously by {@link com.devflow.sprint.events.OutboxPublisher}.
 */
@Service
public class OutboxService {

    private static final Logger log = LoggerFactory.getLogger(OutboxService.class);
    private static final String AGGREGATE_TYPE = "Sprint";

    private final OutboxEventRepository outboxEventRepository;

    public OutboxService(OutboxEventRepository outboxEventRepository) {
        this.outboxEventRepository = outboxEventRepository;
    }

    @Transactional
    public void enqueue(SprintEventType eventType, String aggregateId, Map<String, Object> payload) {
        OutboxEvent event = new OutboxEvent();
        event.setAggregateType(AGGREGATE_TYPE);
        event.setAggregateId(aggregateId);
        event.setEventType(eventType.name());
        event.setPayload(payload == null ? Map.of() : new LinkedHashMap<>(payload));
        event.setStatus(OutboxStatus.PENDING);
        event.setRetryCount(0);
        event.setCorrelationId(CorrelationIdHolder.get());
        outboxEventRepository.save(event);
        log.info("eventType={} aggregateId={} userId={} correlationId={} result=outbox_enqueued",
                eventType.name(),
                aggregateId,
                payload != null ? payload.get("actorUserId") : null,
                event.getCorrelationId());
    }
}

package com.devflow.sprint.events;

import com.devflow.common.api.CorrelationIdHolder;
import com.devflow.common.constant.KafkaTopics;
import com.devflow.common.event.EventEnvelope;
import com.devflow.sprint.entity.ProcessedTaskEvent;
import com.devflow.sprint.repository.ProcessedTaskEventRepository;
import com.devflow.sprint.service.SprintAggregateService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Consumes task-events (published by task-service's outbox) and recomputes the affected sprint's
 * task/point aggregates. Idempotent via {@link ProcessedTaskEventRepository} keyed on the
 * envelope's eventId; never rethrows so a bad message cannot poison-pill the consumer group.
 */
@Component
public class TaskEventListener {

    private static final Logger log = LoggerFactory.getLogger(TaskEventListener.class);

    private final SprintAggregateService sprintAggregateService;
    private final ProcessedTaskEventRepository processedTaskEventRepository;
    private final ObjectMapper objectMapper;

    public TaskEventListener(
            SprintAggregateService sprintAggregateService,
            ProcessedTaskEventRepository processedTaskEventRepository,
            ObjectMapper objectMapper
    ) {
        this.sprintAggregateService = sprintAggregateService;
        this.processedTaskEventRepository = processedTaskEventRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = KafkaTopics.TASK_EVENTS, groupId = "sprint-service")
    @Transactional
    public void onTaskEvent(String message) {
        try {
            EventEnvelope envelope = objectMapper.readValue(message, EventEnvelope.class);

            if (envelope.correlationId() != null && !envelope.correlationId().isBlank()) {
                CorrelationIdHolder.set(envelope.correlationId());
            }

            UUID eventId = parseUuid(envelope.eventId());
            if (eventId == null) {
                log.warn("eventType={} result=skipped reason=missing_event_id", envelope.eventType());
                return;
            }
            if (processedTaskEventRepository.existsById(eventId)) {
                log.info("eventType={} eventId={} result=skipped reason=already_processed",
                        envelope.eventType(), eventId);
                return;
            }

            Map<String, Object> payload = envelope.payload() == null ? Map.of() : envelope.payload();
            handle(envelope.eventType(), payload);

            processedTaskEventRepository.save(new ProcessedTaskEvent(eventId));
            log.info("eventType={} eventId={} result=processed", envelope.eventType(), eventId);
        } catch (Exception ex) {
            log.error("result=consume_failed", ex);
        } finally {
            CorrelationIdHolder.clear();
        }
    }

    private void handle(String eventType, Map<String, Object> payload) {
        if (eventType == null) {
            return;
        }
        switch (eventType) {
            case "TASK_CREATED", "TASK_DELETED" -> sprintAggregateService.recompute(uuid(payload, "sprintId"));
            case "TASK_UPDATED" -> {
                UUID sprintId = uuid(payload, "sprintId");
                UUID previousSprintId = uuid(payload, "previousSprintId");
                sprintAggregateService.recompute(sprintId);
                if (previousSprintId != null && !previousSprintId.equals(sprintId)) {
                    sprintAggregateService.recompute(previousSprintId);
                }
            }
            case "TASKS_BULK_MOVED" -> {
                sprintAggregateService.recompute(uuid(payload, "toSprintId"));
                for (UUID fromSprintId : uuidList(payload, "fromSprintIds")) {
                    sprintAggregateService.recompute(fromSprintId);
                }
            }
            default -> log.debug("eventType={} result=ignored reason=not_sprint_relevant", eventType);
        }
    }

    private static UUID uuid(Map<String, Object> payload, String field) {
        Object value = payload.get(field);
        return value == null ? null : parseUuid(value.toString());
    }

    private static List<UUID> uuidList(Map<String, Object> payload, String field) {
        Object value = payload.get(field);
        if (!(value instanceof List<?> raw)) {
            return List.of();
        }
        List<UUID> result = new ArrayList<>();
        for (Object item : raw) {
            if (item == null) {
                continue;
            }
            UUID id = parseUuid(item.toString());
            if (id != null) {
                result.add(id);
            }
        }
        return result;
    }

    private static UUID parseUuid(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}

package com.devflow.analytics.events;

import com.devflow.analytics.entity.AnalyticsBurndownPoint;
import com.devflow.analytics.entity.AnalyticsSprintSnapshot;
import com.devflow.analytics.entity.ProcessedEvent;
import com.devflow.analytics.repository.AnalyticsBurndownPointRepository;
import com.devflow.analytics.repository.AnalyticsSprintSnapshotRepository;
import com.devflow.analytics.repository.ProcessedEventRepository;
import com.devflow.common.api.CorrelationIdHolder;
import com.devflow.common.constant.KafkaTopics;
import com.devflow.common.event.EventEnvelope;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.UUID;

/**
 * Consumes sprint-events (published by sprint-service's outbox) into analytics-service's own
 * read-model tables. Idempotent via {@link ProcessedEventRepository} keyed on the envelope's
 * eventId; never rethrows so a bad message cannot poison-pill the consumer group. Payload field
 * access is defensive: a missing/malformed field is logged and skipped rather than thrown, so one
 * malformed event cannot wedge the consumer.
 */
@Component
public class SprintEventListener {

    private static final Logger log = LoggerFactory.getLogger(SprintEventListener.class);

    private static final String EVENT_SPRINT_CREATED = "SPRINT_CREATED";
    private static final String EVENT_SPRINT_UPDATED = "SPRINT_UPDATED";
    private static final String EVENT_SPRINT_STARTED = "SPRINT_STARTED";
    private static final String EVENT_SPRINT_COMPLETED = "SPRINT_COMPLETED";
    private static final String EVENT_SPRINT_ARCHIVED = "SPRINT_ARCHIVED";
    private static final String EVENT_SPRINT_DELETED = "SPRINT_DELETED";
    private static final String EVENT_BURNDOWN_SNAPSHOT_RECORDED = "BURNDOWN_SNAPSHOT_RECORDED";

    private final AnalyticsSprintSnapshotRepository sprintSnapshotRepository;
    private final AnalyticsBurndownPointRepository burndownPointRepository;
    private final ProcessedEventRepository processedEventRepository;
    private final ObjectMapper objectMapper;

    public SprintEventListener(
            AnalyticsSprintSnapshotRepository sprintSnapshotRepository,
            AnalyticsBurndownPointRepository burndownPointRepository,
            ProcessedEventRepository processedEventRepository,
            ObjectMapper objectMapper
    ) {
        this.sprintSnapshotRepository = sprintSnapshotRepository;
        this.burndownPointRepository = burndownPointRepository;
        this.processedEventRepository = processedEventRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = KafkaTopics.SPRINT_EVENTS, groupId = "analytics-service")
    @Transactional
    public void onSprintEvent(String message) {
        try {
            EventEnvelope envelope = objectMapper.readValue(message, EventEnvelope.class);

            if (envelope.correlationId() != null && !envelope.correlationId().isBlank()) {
                CorrelationIdHolder.set(envelope.correlationId());
            }

            String eventId = envelope.eventId();
            if (eventId == null || eventId.isBlank()) {
                log.warn("eventType={} result=skipped reason=missing_event_id", envelope.eventType());
                return;
            }
            if (processedEventRepository.existsByEventId(eventId)) {
                log.info("eventType={} eventId={} result=skipped reason=already_processed",
                        envelope.eventType(), eventId);
                return;
            }

            Map<String, Object> payload = envelope.payload() == null ? Map.of() : envelope.payload();
            handle(envelope.eventType(), payload);

            processedEventRepository.save(new ProcessedEvent(eventId));
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
            case EVENT_SPRINT_CREATED, EVENT_SPRINT_UPDATED, EVENT_SPRINT_STARTED,
                    EVENT_SPRINT_COMPLETED, EVENT_SPRINT_ARCHIVED -> upsertSnapshot(eventType, payload);
            case EVENT_SPRINT_DELETED -> deleteSnapshot(payload);
            case EVENT_BURNDOWN_SNAPSHOT_RECORDED -> upsertBurndownPoint(payload);
            default -> log.debug("eventType={} result=ignored reason=not_analytics_relevant", eventType);
        }
    }

    private void upsertSnapshot(String eventType, Map<String, Object> payload) {
        UUID sprintId = uuid(payload, "sprintId");
        if (sprintId == null) {
            log.warn("eventType={} result=skipped reason=missing_sprint_id", eventType);
            return;
        }

        AnalyticsSprintSnapshot snapshot = sprintSnapshotRepository.findById(sprintId)
                .orElseGet(() -> {
                    AnalyticsSprintSnapshot created = new AnalyticsSprintSnapshot();
                    created.setId(sprintId);
                    return created;
                });

        if (has(payload, "projectId")) {
            snapshot.setProjectId(uuid(payload, "projectId"));
        }
        if (has(payload, "organizationId")) {
            snapshot.setOrganizationId(uuid(payload, "organizationId"));
        }
        if (has(payload, "name")) {
            snapshot.setName(string(payload, "name"));
        }
        if (has(payload, "status")) {
            snapshot.setStatus(string(payload, "status"));
        }
        if (has(payload, "startDate")) {
            snapshot.setStartDate(localDate(payload, "startDate"));
        }
        if (has(payload, "endDate")) {
            snapshot.setEndDate(localDate(payload, "endDate"));
        }
        if (has(payload, "committedPoints")) {
            snapshot.setCommittedPoints(integer(payload, "committedPoints"));
        }
        if (has(payload, "completedPoints")) {
            snapshot.setCompletedPoints(integer(payload, "completedPoints"));
        }
        if (has(payload, "velocity")) {
            snapshot.setVelocity(integer(payload, "velocity"));
        }
        if (has(payload, "health")) {
            snapshot.setHealth(string(payload, "health"));
        }

        sprintSnapshotRepository.save(snapshot);
    }

    private void deleteSnapshot(Map<String, Object> payload) {
        UUID sprintId = uuid(payload, "sprintId");
        if (sprintId == null) {
            log.warn("eventType={} result=skipped reason=missing_sprint_id", EVENT_SPRINT_DELETED);
            return;
        }
        sprintSnapshotRepository.findById(sprintId).ifPresent(sprintSnapshotRepository::delete);
    }

    private void upsertBurndownPoint(Map<String, Object> payload) {
        UUID sprintId = uuid(payload, "sprintId");
        LocalDate snapshotDate = localDate(payload, "snapshotDate");
        if (sprintId == null || snapshotDate == null) {
            log.warn("eventType={} result=skipped reason=missing_sprint_id_or_date",
                    EVENT_BURNDOWN_SNAPSHOT_RECORDED);
            return;
        }

        AnalyticsBurndownPoint point = burndownPointRepository
                .findBySprintIdAndSnapshotDate(sprintId, snapshotDate)
                .orElseGet(AnalyticsBurndownPoint::new);
        point.setSprintId(sprintId);
        point.setSnapshotDate(snapshotDate);
        if (has(payload, "remainingPoints")) {
            point.setRemainingPoints(integer(payload, "remainingPoints"));
        }
        if (has(payload, "idealPoints")) {
            point.setIdealPoints(integer(payload, "idealPoints"));
        }
        if (has(payload, "completedPoints")) {
            point.setCompletedPoints(integer(payload, "completedPoints"));
        }

        burndownPointRepository.save(point);
    }

    private static boolean has(Map<String, Object> payload, String field) {
        return payload.get(field) != null;
    }

    private static String string(Map<String, Object> payload, String field) {
        Object value = payload.get(field);
        return value == null ? null : value.toString();
    }

    private static UUID uuid(Map<String, Object> payload, String field) {
        String raw = string(payload, field);
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException ex) {
            log.warn("field={} value={} result=invalid_uuid", field, raw);
            return null;
        }
    }

    private static LocalDate localDate(Map<String, Object> payload, String field) {
        String raw = string(payload, field);
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(raw);
        } catch (DateTimeParseException ex) {
            log.warn("field={} value={} result=invalid_date", field, raw);
            return null;
        }
    }

    private static Integer integer(Map<String, Object> payload, String field) {
        Object value = payload.get(field);
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException ex) {
            log.warn("field={} value={} result=invalid_number", field, value);
            return null;
        }
    }
}

package com.devflow.project.events;

import com.devflow.common.constant.KafkaTopics;
import com.devflow.common.event.EventEnvelope;
import com.devflow.project.entity.OutboxEvent;
import com.devflow.project.entity.OutboxStatus;
import com.devflow.project.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Transactional outbox poller: reads PENDING rows, publishes EventEnvelope JSON to KafkaTopics.PROJECT_EVENTS,
 * then marks PUBLISHED (or FAILED after retries). Domain services never call KafkaTemplate directly.
 */
@Component
public class OutboxPublisher {

    private static final Logger log = LoggerFactory.getLogger(OutboxPublisher.class);
    private static final String SOURCE = "project-service";
    private static final int MAX_RETRIES = 10;
    private static final int MAX_ERROR_LENGTH = 2000;

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final int batchSize;

    public OutboxPublisher(
            OutboxEventRepository outboxEventRepository,
            KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper,
            @Value("${devflow.outbox.batch-size:50}") int batchSize
    ) {
        this.outboxEventRepository = outboxEventRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.batchSize = batchSize;
    }

    @Scheduled(fixedDelayString = "${devflow.outbox.poll-interval-ms:2000}")
    @Transactional
    public void publishPending() {
        List<OutboxEvent> pending = outboxEventRepository.claimPendingForUpdate(batchSize);
        for (OutboxEvent event : pending) {
            publishOne(event);
        }
    }

    private void publishOne(OutboxEvent event) {
        EventEnvelope envelope = EventEnvelope.of(
                event.getEventType(),
                event.getAggregateType(),
                event.getAggregateId(),
                SOURCE,
                event.getPayload(),
                event.getCorrelationId()
        );
        try {
            String json = objectMapper.writeValueAsString(envelope);
            kafkaTemplate.send(KafkaTopics.PROJECT_EVENTS, event.getAggregateId(), json).get();
            event.setStatus(OutboxStatus.PUBLISHED);
            event.setPublishedAt(Instant.now());
            event.setLastError(null);
            outboxEventRepository.save(event);
            log.info("eventType={} aggregateId={} eventId={} correlationId={} result=published",
                    event.getEventType(), event.getAggregateId(), envelope.eventId(), envelope.correlationId());
        } catch (JsonProcessingException ex) {
            fail(event, "serialize_failed", ex);
        } catch (Exception ex) {
            fail(event, "publish_failed", ex);
        }
    }

    private void fail(OutboxEvent event, String result, Exception ex) {
        event.setRetryCount(event.getRetryCount() + 1);
        event.setLastError(truncate(result + ": " + ex.getMessage()));
        if (event.getRetryCount() >= MAX_RETRIES) {
            event.setStatus(OutboxStatus.FAILED);
        }
        outboxEventRepository.save(event);
        log.error("eventType={} aggregateId={} result={} retryCount={}",
                event.getEventType(), event.getAggregateId(), result, event.getRetryCount(), ex);
    }

    private static String truncate(String message) {
        if (message == null) {
            return null;
        }
        return message.length() <= MAX_ERROR_LENGTH ? message : message.substring(0, MAX_ERROR_LENGTH);
    }
}

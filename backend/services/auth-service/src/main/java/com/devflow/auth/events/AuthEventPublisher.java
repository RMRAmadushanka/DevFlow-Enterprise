package com.devflow.auth.events;

import com.devflow.common.api.CorrelationIdHolder;
import com.devflow.common.constant.KafkaTopics;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Publishes authentication domain events. Never includes tokens or secrets.
 */
@Component
public class AuthEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(AuthEventPublisher.class);
    private static final String SOURCE = "auth-service";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public AuthEventPublisher(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void publish(AuthEventType type, String userId) {
        publish(type, userId, Map.of());
    }

    public void publish(AuthEventType type, String userId, Map<String, Object> extra) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("eventId", UUID.randomUUID().toString());
        payload.put("eventType", type.name());
        payload.put("userId", userId);
        payload.put("timestamp", Instant.now().toString());
        payload.put("source", SOURCE);
        payload.put("correlationId", CorrelationIdHolder.get());
        if (extra != null && !extra.isEmpty()) {
            payload.put("metadata", extra);
        }

        try {
            String json = objectMapper.writeValueAsString(payload);
            kafkaTemplate.send(KafkaTopics.USER_AUTHENTICATION_EVENTS, userId != null ? userId : "anonymous", json);
            log.info("eventType={} userId={} result=published topic={}",
                    type, userId, KafkaTopics.USER_AUTHENTICATION_EVENTS);
        } catch (JsonProcessingException ex) {
            log.error("eventType={} userId={} result=serialize_failed", type, userId, ex);
        } catch (Exception ex) {
            log.error("eventType={} userId={} result=publish_failed", type, userId, ex);
        }
    }
}

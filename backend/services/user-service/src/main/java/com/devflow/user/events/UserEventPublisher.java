package com.devflow.user.events;

import com.devflow.common.constant.KafkaTopics;
import com.devflow.common.event.EventEnvelope;
import com.devflow.user.entity.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Publishes user domain events on {@link KafkaTopics#USER_EVENTS}.
 * Never includes tokens or secrets.
 */
@Component
public class UserEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(UserEventPublisher.class);
    private static final String SOURCE = "user-service";
    private static final String AGGREGATE_TYPE = "User";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public UserEventPublisher(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void publish(UserEventType type, User user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("userId", user.getId() != null ? user.getId().toString() : null);
        payload.put("externalIdentityId", user.getExternalIdentityId());
        payload.put("username", user.getUsername());
        payload.put("email", user.getEmail());
        payload.put("status", user.getStatus() != null ? user.getStatus().name() : null);
        if (type == UserEventType.USER_PREFERENCES_UPDATED) {
            payload.put("theme", user.getTheme());
            payload.put("notifyEmail", user.isNotifyEmail());
            payload.put("notifyInApp", user.isNotifyInApp());
        }

        EventEnvelope envelope = EventEnvelope.of(
                type.name(),
                AGGREGATE_TYPE,
                user.getId() != null ? user.getId().toString() : user.getExternalIdentityId(),
                SOURCE,
                payload
        );

        try {
            String json = objectMapper.writeValueAsString(envelope);
            String key = user.getId() != null ? user.getId().toString() : user.getExternalIdentityId();
            kafkaTemplate.send(KafkaTopics.USER_EVENTS, key, json);
            log.info("eventType={} userId={} externalIdentityId={} result=published topic={}",
                    type, user.getId(), user.getExternalIdentityId(), KafkaTopics.USER_EVENTS);
        } catch (JsonProcessingException ex) {
            log.error("eventType={} userId={} result=serialize_failed", type, user.getId(), ex);
        } catch (Exception ex) {
            log.error("eventType={} userId={} result=publish_failed", type, user.getId(), ex);
        }
    }
}

package com.devflow.organization.events;

import com.devflow.common.constant.KafkaTopics;
import com.devflow.common.event.EventEnvelope;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Publishes organization/team/membership/invitation domain events.
 * Never includes invitation raw tokens or secrets in payloads.
 */
@Component
public class OrganizationEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrganizationEventPublisher.class);
    private static final String SOURCE = "organization-service";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public OrganizationEventPublisher(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishOrganization(OrganizationEventType type, String aggregateId, Map<String, Object> payload) {
        String topic = switch (type) {
            case ORGANIZATION_MEMBER_ADDED, ORGANIZATION_MEMBER_REMOVED, ORGANIZATION_ROLE_CHANGED ->
                    KafkaTopics.MEMBERSHIP_EVENTS;
            default -> KafkaTopics.ORGANIZATION_EVENTS;
        };
        publish(topic, type.name(), "Organization", aggregateId, payload);
    }

    public void publishTeam(TeamEventType type, String aggregateId, Map<String, Object> payload) {
        publish(KafkaTopics.TEAM_EVENTS, type.name(), "Team", aggregateId, payload);
    }

    public void publishInvitation(InvitationEventType type, String aggregateId, Map<String, Object> payload) {
        publish(KafkaTopics.INVITATION_EVENTS, type.name(), "Invitation", aggregateId, payload);
    }

    private void publish(
            String topic,
            String eventType,
            String aggregateType,
            String aggregateId,
            Map<String, Object> payload
    ) {
        EventEnvelope envelope = EventEnvelope.of(eventType, aggregateType, aggregateId, SOURCE, payload);
        try {
            String json = objectMapper.writeValueAsString(envelope);
            kafkaTemplate.send(topic, aggregateId != null ? aggregateId : "unknown", json);
            log.info("eventType={} aggregateType={} aggregateId={} topic={} result=published",
                    eventType, aggregateType, aggregateId, topic);
        } catch (JsonProcessingException ex) {
            log.error("eventType={} aggregateId={} result=serialize_failed", eventType, aggregateId, ex);
        } catch (Exception ex) {
            log.error("eventType={} aggregateId={} result=publish_failed", eventType, aggregateId, ex);
        }
    }
}

package com.devflow.user.events;

import com.devflow.common.api.CorrelationIdHolder;
import com.devflow.common.constant.KafkaTopics;
import com.devflow.user.dto.CreateUserRequest;
import com.devflow.user.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes auth-service events and idempotently upserts local user profiles.
 */
@Component
public class UserAuthenticatedListener {

    private static final Logger log = LoggerFactory.getLogger(UserAuthenticatedListener.class);

    private final UserService userService;
    private final ObjectMapper objectMapper;

    public UserAuthenticatedListener(UserService userService, ObjectMapper objectMapper) {
        this.userService = userService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = KafkaTopics.USER_AUTHENTICATION_EVENTS, groupId = "user-service")
    public void onAuthenticationEvent(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventType = text(root, "eventType");
            if (!"USER_AUTHENTICATED".equals(eventType)) {
                return;
            }

            String correlationId = text(root, "correlationId");
            if (correlationId != null && !correlationId.isBlank()) {
                CorrelationIdHolder.set(correlationId);
            }

            String externalIdentityId = text(root, "userId");
            if (externalIdentityId == null || externalIdentityId.isBlank()) {
                log.warn("eventType=USER_AUTHENTICATED result=skipped reason=missing_userId");
                return;
            }

            JsonNode metadata = root.path("metadata");
            CreateUserRequest request = new CreateUserRequest(
                    externalIdentityId,
                    text(metadata, "username"),
                    text(metadata, "email"),
                    text(metadata, "firstName"),
                    text(metadata, "lastName"),
                    null
            );
            userService.upsertFromExternalIdentity(request);
            log.info("eventType=USER_AUTHENTICATED externalIdentityId={} result=upserted", externalIdentityId);
        } catch (Exception ex) {
            log.error("eventType=USER_AUTHENTICATED result=consume_failed", ex);
        } finally {
            CorrelationIdHolder.clear();
        }
    }

    private static String text(JsonNode node, String field) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        String text = value.asText();
        return text == null || text.isBlank() ? null : text;
    }
}

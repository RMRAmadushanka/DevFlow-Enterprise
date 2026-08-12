package com.devflow.auth.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthEventPublisherTest {

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @Test
    void publishDoesNotIncludeTokens() {
        AuthEventPublisher publisher = new AuthEventPublisher(kafkaTemplate, new ObjectMapper());
        publisher.publish(AuthEventType.USER_AUTHENTICATED, "user-1");

        ArgumentCaptor<String> payload = ArgumentCaptor.forClass(String.class);
        verify(kafkaTemplate).send(eq("user-authentication-events"), eq("user-1"), payload.capture());

        String json = payload.getValue();
        assertTrue(json.contains("USER_AUTHENTICATED"));
        assertTrue(json.contains("user-1"));
        assertFalse(json.toLowerCase().contains("bearer"));
        assertFalse(json.toLowerCase().contains("password"));
        assertFalse(json.contains("refresh"));
    }
}

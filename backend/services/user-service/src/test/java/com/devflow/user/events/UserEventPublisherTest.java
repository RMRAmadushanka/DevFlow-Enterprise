package com.devflow.user.events;

import com.devflow.user.entity.User;
import com.devflow.user.entity.UserStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.lang.reflect.Field;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserEventPublisherTest {

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @Test
    void publishDoesNotIncludeTokensOrSecrets() throws Exception {
        UserEventPublisher publisher = new UserEventPublisher(kafkaTemplate, new ObjectMapper());
        User user = new User();
        setId(user, UUID.fromString("55555555-5555-5555-5555-555555555555"));
        user.setExternalIdentityId("kc-sub-5");
        user.setUsername("erin");
        user.setEmail("erin@devflow.local");
        user.setStatus(UserStatus.ACTIVE);

        publisher.publish(UserEventType.USER_CREATED, user);

        ArgumentCaptor<String> payload = ArgumentCaptor.forClass(String.class);
        verify(kafkaTemplate).send(eq("user-events"), eq("55555555-5555-5555-5555-555555555555"), payload.capture());

        String json = payload.getValue();
        assertTrue(json.contains("USER_CREATED"));
        assertTrue(json.contains("kc-sub-5"));
        assertTrue(json.contains("eventId"));
        assertTrue(json.contains("aggregateType"));
        assertFalse(json.toLowerCase().contains("bearer"));
        assertFalse(json.toLowerCase().contains("password"));
        assertFalse(json.contains("refresh"));
        assertFalse(json.contains("access_token"));
    }

    private static void setId(User user, UUID id) throws Exception {
        Field idField = user.getClass().getSuperclass().getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(user, id);
    }
}

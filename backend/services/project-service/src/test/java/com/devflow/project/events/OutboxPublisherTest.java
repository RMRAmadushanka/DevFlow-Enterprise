package com.devflow.project.events;

import com.devflow.common.constant.KafkaTopics;
import com.devflow.project.entity.OutboxEvent;
import com.devflow.project.entity.OutboxStatus;
import com.devflow.project.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OutboxPublisherTest {

    @Mock
    private OutboxEventRepository outboxEventRepository;
    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private OutboxPublisher publisher;

    @BeforeEach
    void setUp() {
        publisher = new OutboxPublisher(outboxEventRepository, kafkaTemplate, objectMapper, 50);
    }

    @Test
    void publishPendingSendsEnvelopeAndMarksPublished() throws Exception {
        OutboxEvent event = pendingEvent("PROJECT_CREATED", "corr-abc", Map.of(
                "projectId", "p1",
                "actorUserId", "u1"
        ));
        when(outboxEventRepository.claimPendingForUpdate(50)).thenReturn(List.of(event));
        when(kafkaTemplate.send(eq(KafkaTopics.PROJECT_EVENTS), eq("agg-1"), any(String.class)))
                .thenReturn(CompletableFuture.completedFuture(null));

        publisher.publishPending();

        ArgumentCaptor<String> jsonCaptor = ArgumentCaptor.forClass(String.class);
        verify(kafkaTemplate).send(eq(KafkaTopics.PROJECT_EVENTS), eq("agg-1"), jsonCaptor.capture());

        JsonNode root = objectMapper.readTree(jsonCaptor.getValue());
        assertThat(root.get("eventType").asText()).isEqualTo("PROJECT_CREATED");
        assertThat(root.get("aggregateType").asText()).isEqualTo("Project");
        assertThat(root.get("aggregateId").asText()).isEqualTo("agg-1");
        assertThat(root.get("source").asText()).isEqualTo("project-service");
        assertThat(root.get("version").asInt()).isEqualTo(1);
        assertThat(root.get("correlationId").asText()).isEqualTo("corr-abc");
        assertThat(root.get("eventId").asText()).isNotBlank();
        assertThat(root.get("payload").get("projectId").asText()).isEqualTo("p1");

        Set<String> forbidden = Set.of("password", "accessToken", "refreshToken", "jwt", "secret", "Authorization");
        root.get("payload").fieldNames().forEachRemaining(name ->
                assertThat(forbidden).doesNotContain(name));

        ArgumentCaptor<OutboxEvent> saved = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxEventRepository).save(saved.capture());
        assertThat(saved.getValue().getStatus()).isEqualTo(OutboxStatus.PUBLISHED);
        assertThat(saved.getValue().getPublishedAt()).isNotNull();
        assertThat(saved.getValue().getLastError()).isNull();
    }

    @Test
    void publishFailureIncrementsRetryAndStoresLastError() {
        OutboxEvent event = pendingEvent("PROJECT_UPDATED", "corr-x", Map.of("projectId", "p1"));
        when(outboxEventRepository.claimPendingForUpdate(50)).thenReturn(List.of(event));
        when(kafkaTemplate.send(eq(KafkaTopics.PROJECT_EVENTS), eq("agg-1"), any(String.class)))
                .thenReturn(CompletableFuture.failedFuture(new RuntimeException("broker down")));

        publisher.publishPending();

        ArgumentCaptor<OutboxEvent> saved = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxEventRepository).save(saved.capture());
        assertThat(saved.getValue().getStatus()).isEqualTo(OutboxStatus.PENDING);
        assertThat(saved.getValue().getRetryCount()).isEqualTo(1);
        assertThat(saved.getValue().getLastError()).contains("publish_failed");
    }

    @Test
    void publishMarksFailedAfterMaxRetries() {
        OutboxEvent event = pendingEvent("PROJECT_UPDATED", null, Map.of());
        event.setRetryCount(9);
        when(outboxEventRepository.claimPendingForUpdate(50)).thenReturn(List.of(event));
        when(kafkaTemplate.send(eq(KafkaTopics.PROJECT_EVENTS), eq("agg-1"), any(String.class)))
                .thenReturn(CompletableFuture.failedFuture(new RuntimeException("still down")));

        publisher.publishPending();

        ArgumentCaptor<OutboxEvent> saved = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxEventRepository).save(saved.capture());
        assertThat(saved.getValue().getRetryCount()).isEqualTo(10);
        assertThat(saved.getValue().getStatus()).isEqualTo(OutboxStatus.FAILED);
        assertThat(saved.getValue().getLastError()).isNotBlank();
    }

    @Test
    void duplicatePendingRowsEachProduceDistinctEventIds() throws Exception {
        OutboxEvent first = pendingEvent("PROJECT_CREATED", "c1", Map.of("projectId", "p1"));
        OutboxEvent second = pendingEvent("PROJECT_CREATED", "c1", Map.of("projectId", "p1"));
        when(outboxEventRepository.claimPendingForUpdate(50)).thenReturn(List.of(first, second));
        when(kafkaTemplate.send(eq(KafkaTopics.PROJECT_EVENTS), eq("agg-1"), any(String.class)))
                .thenReturn(CompletableFuture.completedFuture(null));

        publisher.publishPending();

        ArgumentCaptor<String> jsonCaptor = ArgumentCaptor.forClass(String.class);
        verify(kafkaTemplate, times(2)).send(eq(KafkaTopics.PROJECT_EVENTS), eq("agg-1"), jsonCaptor.capture());
        String id1 = objectMapper.readTree(jsonCaptor.getAllValues().get(0)).get("eventId").asText();
        String id2 = objectMapper.readTree(jsonCaptor.getAllValues().get(1)).get("eventId").asText();
        assertThat(id1).isNotEqualTo(id2);
    }

    private static OutboxEvent pendingEvent(String type, String correlationId, Map<String, Object> payload) {
        OutboxEvent event = new OutboxEvent();
        event.setAggregateType("Project");
        event.setAggregateId("agg-1");
        event.setEventType(type);
        event.setPayload(payload);
        event.setStatus(OutboxStatus.PENDING);
        event.setRetryCount(0);
        event.setCorrelationId(correlationId);
        return event;
    }
}

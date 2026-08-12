package com.devflow.project.service;

import com.devflow.common.api.CorrelationIdHolder;
import com.devflow.project.entity.OutboxEvent;
import com.devflow.project.entity.OutboxStatus;
import com.devflow.project.events.ProjectEventPublisher;
import com.devflow.project.events.ProjectEventType;
import com.devflow.project.repository.OutboxEventRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OutboxServiceTest {

    @Mock
    private OutboxEventRepository outboxEventRepository;

    @InjectMocks
    private OutboxService outboxService;

    @AfterEach
    void clearCorrelation() {
        CorrelationIdHolder.clear();
    }

    @Test
    void enqueueWritesPendingOutboxRowWithCorrelationId() {
        CorrelationIdHolder.set("corr-from-request");
        when(outboxEventRepository.save(any(OutboxEvent.class))).thenAnswer(inv -> inv.getArgument(0));

        String aggregateId = UUID.randomUUID().toString();
        outboxService.enqueue(ProjectEventType.PROJECT_CREATED, aggregateId, Map.of(
                "projectId", aggregateId,
                "actorUserId", UUID.randomUUID().toString()
        ));

        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxEventRepository).save(captor.capture());
        OutboxEvent event = captor.getValue();
        assertThat(event.getEventType()).isEqualTo("PROJECT_CREATED");
        assertThat(event.getAggregateType()).isEqualTo("Project");
        assertThat(event.getAggregateId()).isEqualTo(aggregateId);
        assertThat(event.getStatus()).isEqualTo(OutboxStatus.PENDING);
        assertThat(event.getCorrelationId()).isEqualTo("corr-from-request");
        assertThat(event.getPayload()).containsKey("projectId");
        assertThat(event.getPayload()).doesNotContainKeys("password", "accessToken", "refreshToken");
    }

    @Test
    void projectEventPublisherDelegatesToOutbox() {
        when(outboxEventRepository.save(any(OutboxEvent.class))).thenAnswer(inv -> inv.getArgument(0));
        ProjectEventPublisher publisher = new ProjectEventPublisher(outboxService);

        publisher.publish(ProjectEventType.PROJECT_UPDATED, "agg-1", Map.of("x", "y"));

        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxEventRepository).save(captor.capture());
        assertThat(captor.getValue().getEventType()).isEqualTo("PROJECT_UPDATED");
    }
}

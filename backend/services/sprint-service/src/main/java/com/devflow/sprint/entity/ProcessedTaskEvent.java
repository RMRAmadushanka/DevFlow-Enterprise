package com.devflow.sprint.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Idempotency guard for {@link com.devflow.sprint.events.TaskEventListener}: one row per
 * successfully processed task-events eventId. The id is assigned from the envelope, never generated.
 */
@Entity
@Table(name = "processed_task_events")
public class ProcessedTaskEvent {

    @Id
    private UUID eventId;

    @Column(name = "processed_at", nullable = false, updatable = false)
    private Instant processedAt;

    @PrePersist
    void onCreate() {
        if (processedAt == null) {
            processedAt = Instant.now();
        }
    }

    public ProcessedTaskEvent() {
    }

    public ProcessedTaskEvent(UUID eventId) {
        this.eventId = eventId;
    }

    public UUID getEventId() {
        return eventId;
    }

    public void setEventId(UUID eventId) {
        this.eventId = eventId;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }
}

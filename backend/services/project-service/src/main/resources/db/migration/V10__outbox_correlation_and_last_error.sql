-- Persist request correlation for async outbox publish; capture last publish error for ops.
ALTER TABLE outbox_events
    ADD COLUMN IF NOT EXISTS correlation_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS last_error TEXT;

CREATE INDEX IF NOT EXISTS idx_outbox_events_correlation_id
    ON outbox_events (correlation_id)
    WHERE correlation_id IS NOT NULL;

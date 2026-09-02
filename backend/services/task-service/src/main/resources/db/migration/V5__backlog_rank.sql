-- Backlog drag-and-drop ordering
ALTER TABLE tasks
    ADD COLUMN backlog_rank INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_tasks_project_backlog_rank ON tasks (project_id, backlog_rank);

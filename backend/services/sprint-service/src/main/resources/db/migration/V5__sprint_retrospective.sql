-- Sprint retrospective board: WENT_WELL / NEEDS_IMPROVEMENT / ACTION_ITEM cards with per-user
-- toggle votes, plus a separate free-form discussion comment thread.
CREATE TABLE sprint_retro_item (
    id           UUID PRIMARY KEY,
    sprint_id    UUID         NOT NULL REFERENCES sprints (id) ON DELETE CASCADE,
    column_type  VARCHAR(32)  NOT NULL,
    text         VARCHAR(2000) NOT NULL,
    author_id    UUID,
    author_name  VARCHAR(160),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT ck_sprint_retro_item_column_type CHECK (column_type IN (
        'WENT_WELL', 'NEEDS_IMPROVEMENT', 'ACTION_ITEM'
    ))
);

CREATE INDEX idx_sprint_retro_item_sprint_created ON sprint_retro_item (sprint_id, created_at ASC);

CREATE TABLE sprint_retro_vote (
    id       UUID PRIMARY KEY,
    item_id  UUID NOT NULL REFERENCES sprint_retro_item (id) ON DELETE CASCADE,
    user_id  UUID NOT NULL,
    CONSTRAINT uq_sprint_retro_vote_item_user UNIQUE (item_id, user_id)
);

CREATE INDEX idx_sprint_retro_vote_item ON sprint_retro_vote (item_id);

CREATE TABLE sprint_retro_comment (
    id           UUID PRIMARY KEY,
    sprint_id    UUID         NOT NULL REFERENCES sprints (id) ON DELETE CASCADE,
    author_id    UUID,
    author_name  VARCHAR(160),
    text         VARCHAR(2000) NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_sprint_retro_comment_sprint_created ON sprint_retro_comment (sprint_id, created_at ASC);

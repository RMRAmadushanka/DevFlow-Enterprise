package com.devflow.sprint.repository;

import com.devflow.sprint.entity.SprintRetroComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SprintRetroCommentRepository extends JpaRepository<SprintRetroComment, UUID> {

    List<SprintRetroComment> findBySprintIdOrderByCreatedAtAsc(UUID sprintId);
}

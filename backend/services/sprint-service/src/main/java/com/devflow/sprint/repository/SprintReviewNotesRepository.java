package com.devflow.sprint.repository;

import com.devflow.sprint.entity.SprintReviewNotes;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SprintReviewNotesRepository extends JpaRepository<SprintReviewNotes, UUID> {
}

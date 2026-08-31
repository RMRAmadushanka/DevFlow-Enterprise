package com.devflow.sprint.repository;

import com.devflow.sprint.entity.ProcessedTaskEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProcessedTaskEventRepository extends JpaRepository<ProcessedTaskEvent, UUID> {
}

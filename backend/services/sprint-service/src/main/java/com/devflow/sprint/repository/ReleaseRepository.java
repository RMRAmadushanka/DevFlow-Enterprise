package com.devflow.sprint.repository;

import com.devflow.sprint.entity.Release;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReleaseRepository extends JpaRepository<Release, UUID> {

    List<Release> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
}

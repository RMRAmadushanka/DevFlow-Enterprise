package com.devflow.task.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Repository
public class TaskCounterRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public long nextNumber(UUID projectId) {
        int updated = entityManager.createNativeQuery(
                        "UPDATE task_counters SET next_number = next_number + 1 WHERE project_id = :projectId")
                .setParameter("projectId", projectId)
                .executeUpdate();
        if (updated == 0) {
            entityManager.createNativeQuery(
                            "INSERT INTO task_counters (project_id, next_number) VALUES (:projectId, 2)")
                    .setParameter("projectId", projectId)
                    .executeUpdate();
            return 1L;
        }
        Object value = entityManager.createNativeQuery(
                        "SELECT next_number - 1 FROM task_counters WHERE project_id = :projectId")
                .setParameter("projectId", projectId)
                .getSingleResult();
        return ((Number) value).longValue();
    }
}

package com.devflow.sprint.repository;

import com.devflow.sprint.entity.SprintRetroVote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SprintRetroVoteRepository extends JpaRepository<SprintRetroVote, UUID> {

    List<SprintRetroVote> findByItemIdIn(Collection<UUID> itemIds);

    Optional<SprintRetroVote> findByItemIdAndUserId(UUID itemId, UUID userId);
}

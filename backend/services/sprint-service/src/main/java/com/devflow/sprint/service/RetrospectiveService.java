package com.devflow.sprint.service;

import com.devflow.sprint.dto.CreateRetroCommentRequest;
import com.devflow.sprint.dto.CreateRetroItemRequest;
import com.devflow.sprint.dto.RetroBoardResponse;
import com.devflow.sprint.dto.RetroCommentResponse;
import com.devflow.sprint.dto.RetroItemResponse;
import com.devflow.sprint.entity.RetroColumnType;
import com.devflow.sprint.entity.Sprint;
import com.devflow.sprint.entity.SprintRetroComment;
import com.devflow.sprint.entity.SprintRetroItem;
import com.devflow.sprint.entity.SprintRetroVote;
import com.devflow.sprint.exception.RetroItemNotFoundException;
import com.devflow.sprint.exception.SprintNotFoundException;
import com.devflow.sprint.exception.SprintValidationException;
import com.devflow.sprint.repository.SprintRepository;
import com.devflow.sprint.repository.SprintRetroCommentRepository;
import com.devflow.sprint.repository.SprintRetroItemRepository;
import com.devflow.sprint.repository.SprintRetroVoteRepository;
import com.devflow.sprint.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Sprint retrospective board: WENT_WELL / NEEDS_IMPROVEMENT / ACTION_ITEM cards with per-user
 * toggle votes, plus a separate free-form comment thread. Backs {@code RetrospectiveController}.
 */
@Service
public class RetrospectiveService {

    private final SprintRepository sprintRepository;
    private final SprintAuthorizationService authorizationService;
    private final SprintRetroItemRepository itemRepository;
    private final SprintRetroVoteRepository voteRepository;
    private final SprintRetroCommentRepository commentRepository;
    private final SprintActivityService activityService;

    public RetrospectiveService(
            SprintRepository sprintRepository,
            SprintAuthorizationService authorizationService,
            SprintRetroItemRepository itemRepository,
            SprintRetroVoteRepository voteRepository,
            SprintRetroCommentRepository commentRepository,
            SprintActivityService activityService
    ) {
        this.sprintRepository = sprintRepository;
        this.authorizationService = authorizationService;
        this.itemRepository = itemRepository;
        this.voteRepository = voteRepository;
        this.commentRepository = commentRepository;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public RetroBoardResponse getBoard(UUID sprintId) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireRead(sprint, actorId);

        List<SprintRetroItem> items = itemRepository.findBySprintIdOrderByCreatedAtAsc(sprintId);
        List<UUID> itemIds = items.stream().map(SprintRetroItem::getId).toList();
        List<SprintRetroVote> votes = itemIds.isEmpty() ? List.of() : voteRepository.findByItemIdIn(itemIds);

        Map<UUID, Long> voteCounts = votes.stream()
                .collect(Collectors.groupingBy(SprintRetroVote::getItemId, Collectors.counting()));
        Set<UUID> votedByMe = votes.stream()
                .filter(v -> actorId.equals(v.getUserId()))
                .map(SprintRetroVote::getItemId)
                .collect(Collectors.toSet());

        List<RetroItemResponse> itemResponses = items.stream()
                .map(i -> toItemResponse(i, voteCounts.getOrDefault(i.getId(), 0L).intValue(), votedByMe.contains(i.getId())))
                .toList();

        List<RetroCommentResponse> commentResponses = commentRepository.findBySprintIdOrderByCreatedAtAsc(sprintId).stream()
                .map(this::toCommentResponse)
                .toList();

        return new RetroBoardResponse(itemResponses, commentResponses);
    }

    @Transactional
    public RetroItemResponse addItem(UUID sprintId, CreateRetroItemRequest request) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireUpdate(sprint, actorId);

        SprintRetroItem item = new SprintRetroItem();
        item.setSprintId(sprintId);
        item.setColumnType(toColumnType(request.columnType()));
        item.setText(request.text().trim());
        item.setAuthorId(actorId);
        item.setAuthorName(SecurityUtils.currentUsername());
        item = itemRepository.save(item);

        activityService.record(sprintId, actorId, SecurityUtils.currentUsername(),
                "RETRO_ITEM_ADDED", "added a retrospective item");

        return toItemResponse(item, 0, false);
    }

    @Transactional
    public RetroItemResponse toggleVote(UUID sprintId, UUID itemId) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireUpdate(sprint, actorId);

        SprintRetroItem item = itemRepository.findById(itemId)
                .filter(i -> sprintId.equals(i.getSprintId()))
                .orElseThrow(() -> new RetroItemNotFoundException("Retro item not found: " + itemId));

        Optional<SprintRetroVote> existing = voteRepository.findByItemIdAndUserId(itemId, actorId);
        boolean votedByCurrentUser;
        if (existing.isPresent()) {
            voteRepository.delete(existing.get());
            votedByCurrentUser = false;
        } else {
            SprintRetroVote vote = new SprintRetroVote();
            vote.setItemId(itemId);
            vote.setUserId(actorId);
            voteRepository.save(vote);
            votedByCurrentUser = true;
        }

        int voteCount = voteRepository.findByItemIdIn(List.of(itemId)).size();

        activityService.record(sprintId, actorId, SecurityUtils.currentUsername(),
                "RETRO_ITEM_VOTED",
                votedByCurrentUser ? "voted on a retrospective item" : "removed a vote from a retrospective item");

        return toItemResponse(item, voteCount, votedByCurrentUser);
    }

    @Transactional
    public RetroCommentResponse addComment(UUID sprintId, CreateRetroCommentRequest request) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireUpdate(sprint, actorId);

        SprintRetroComment comment = new SprintRetroComment();
        comment.setSprintId(sprintId);
        comment.setAuthorId(actorId);
        comment.setAuthorName(SecurityUtils.currentUsername());
        comment.setText(request.text().trim());
        comment = commentRepository.save(comment);

        activityService.record(sprintId, actorId, SecurityUtils.currentUsername(),
                "RETRO_COMMENT_ADDED", "commented on the retrospective");

        return toCommentResponse(comment);
    }

    private static RetroColumnType toColumnType(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new SprintValidationException("columnType is required");
        }
        try {
            return RetroColumnType.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new SprintValidationException("Invalid column type: " + raw);
        }
    }

    private static RetroItemResponse toItemResponse(SprintRetroItem item, int voteCount, boolean votedByCurrentUser) {
        return new RetroItemResponse(
                item.getId(),
                item.getColumnType().name(),
                item.getText(),
                item.getAuthorId(),
                item.getAuthorName(),
                item.getCreatedAt(),
                voteCount,
                votedByCurrentUser
        );
    }

    private RetroCommentResponse toCommentResponse(SprintRetroComment comment) {
        return new RetroCommentResponse(
                comment.getId(), comment.getAuthorId(), comment.getAuthorName(), comment.getText(), comment.getCreatedAt());
    }

    private Sprint require(UUID sprintId) {
        return sprintRepository.findById(sprintId)
                .orElseThrow(() -> new SprintNotFoundException("Sprint not found: " + sprintId));
    }
}

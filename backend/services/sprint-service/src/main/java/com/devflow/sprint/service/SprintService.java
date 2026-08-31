package com.devflow.sprint.service;

import com.devflow.common.dto.PageResponse;
import com.devflow.sprint.domain.SprintDomainRules;
import com.devflow.sprint.dto.CreateSprintRequest;
import com.devflow.sprint.dto.SprintResponse;
import com.devflow.sprint.dto.SprintStatusUpdateRequest;
import com.devflow.sprint.dto.UpdateSprintRequest;
import com.devflow.sprint.dto.VelocityPointResponse;
import com.devflow.sprint.entity.Sprint;
import com.devflow.sprint.entity.SprintHealth;
import com.devflow.sprint.entity.SprintStatus;
import com.devflow.sprint.events.SprintEventPublisher;
import com.devflow.sprint.events.SprintEventType;
import com.devflow.sprint.exception.SprintNotFoundException;
import com.devflow.sprint.exception.SprintValidationException;
import com.devflow.sprint.mapper.SprintMapper;
import com.devflow.sprint.repository.SprintRepository;
import com.devflow.sprint.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class SprintService {

    private static final Logger log = LoggerFactory.getLogger(SprintService.class);

    private final SprintRepository sprintRepository;
    private final SprintMapper sprintMapper;
    private final SprintAuthorizationService authorizationService;
    private final SprintEventPublisher eventPublisher;
    private final SprintActivityService activityService;

    public SprintService(
            SprintRepository sprintRepository,
            SprintMapper sprintMapper,
            SprintAuthorizationService authorizationService,
            SprintEventPublisher eventPublisher,
            SprintActivityService activityService
    ) {
        this.sprintRepository = sprintRepository;
        this.sprintMapper = sprintMapper;
        this.authorizationService = authorizationService;
        this.eventPublisher = eventPublisher;
        this.activityService = activityService;
    }

    @Transactional
    public SprintResponse create(CreateSprintRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new SprintValidationException("End date must be after start date");
        }

        UUID actorId = SecurityUtils.requireCurrentUserId();
        if (request.organizationId() != null) {
            authorizationService.requireCreate(request.organizationId(), actorId);
        }

        Sprint sprint = new Sprint();
        sprint.setProjectId(request.projectId());
        sprint.setOrganizationId(request.organizationId());
        sprint.setProjectName(request.projectName().trim());
        sprint.setName(request.name().trim());
        sprint.setGoal(blankToNull(request.goal()));
        sprint.setDescription(blankToNull(request.description()));
        sprint.setStatus(SprintStatus.PLANNING);
        sprint.setStartDate(request.startDate());
        sprint.setEndDate(request.endDate());
        sprint.setCapacityPoints(request.capacityPoints());
        sprint.setStoryPointGoal(request.storyPointGoal());
        sprint.setCompletedPoints(0);
        sprint.setCommittedPoints(0);
        sprint.setTaskCount(0);
        sprint.setCompletedTaskCount(0);
        sprint.setVelocity(0);
        sprint.setHealth(SprintHealth.UNKNOWN);
        sprint.setArchived(false);
        sprint.setCreatedBy(actorId);

        sprint = sprintRepository.save(sprint);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sprintId", sprint.getId().toString());
        payload.put("projectId", sprint.getProjectId().toString());
        payload.put("actorUserId", actorId.toString());
        eventPublisher.publish(SprintEventType.SPRINT_CREATED, sprint.getId().toString(), payload);
        log.info("eventType=SPRINT_CREATED userId={} sprintId={} result=success", actorId, sprint.getId());
        activityService.record(sprint.getId(), actorId, SecurityUtils.currentUsername(),
                "SPRINT_CREATED", "created this sprint");

        return sprintMapper.toResponse(sprint);
    }

    @Transactional(readOnly = true)
    public SprintResponse get(UUID sprintId) {
        Sprint sprint = require(sprintId);
        authorizationService.requireRead(sprint, SecurityUtils.requireCurrentUserId());
        return sprintMapper.toResponse(sprint);
    }

    @Transactional(readOnly = true)
    public PageResponse<SprintResponse> list(
            UUID projectId,
            UUID organizationId,
            String status,
            Boolean archived,
            String search,
            Integer page,
            Integer size,
            String sort
    ) {
        int pageIndex = page == null || page < 0 ? 0 : page;
        int pageSize = size == null || size < 1 ? 50 : Math.min(size, 100);
        Pageable pageable = PageRequest.of(pageIndex, pageSize, resolveSort(sort));

        SprintStatus statusEnum = status == null || status.isBlank() || "all".equalsIgnoreCase(status)
                ? null
                : sprintMapper.toStatus(status);

        Page<Sprint> result = sprintRepository.search(
                projectId,
                organizationId,
                statusEnum,
                archived,
                search == null ? null : search.trim(),
                pageable
        );

        return new PageResponse<>(
                result.getContent().stream().map(sprintMapper::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    /**
     * Generic update, including optional status/archived changes. Status changes made here are
     * still validated via SprintDomainRules (same rules the dedicated start/complete/archive
     * endpoints use) rather than rejecting status changes outright, to stay backwards compatible
     * with existing callers of this endpoint; prefer the dedicated endpoints for new integrations.
     */
    @Transactional
    public SprintResponse update(UUID sprintId, UpdateSprintRequest request) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireUpdate(sprint, actorId);

        SprintStatus previousStatus = sprint.getStatus();

        if (request.name() != null) {
            if (request.name().isBlank()) throw new SprintValidationException("Name cannot be blank");
            sprint.setName(request.name().trim());
        }
        if (request.goal() != null) sprint.setGoal(blankToNull(request.goal()));
        if (request.description() != null) sprint.setDescription(blankToNull(request.description()));
        if (request.projectId() != null) sprint.setProjectId(request.projectId());
        if (request.projectName() != null && !request.projectName().isBlank()) {
            sprint.setProjectName(request.projectName().trim());
        }
        if (request.organizationId() != null) sprint.setOrganizationId(request.organizationId());
        if (request.startDate() != null) sprint.setStartDate(request.startDate());
        if (request.endDate() != null) sprint.setEndDate(request.endDate());
        if (request.capacityPoints() != null) sprint.setCapacityPoints(request.capacityPoints());
        if (request.storyPointGoal() != null) sprint.setStoryPointGoal(request.storyPointGoal());
        if (request.status() != null && !request.status().isBlank()) {
            SprintStatus targetStatus = sprintMapper.toStatus(request.status());
            SprintDomainRules.assertStatusTransition(sprint.getStatus(), targetStatus);
            sprint.setStatus(targetStatus);
        }
        if (Boolean.TRUE.equals(request.archived())) {
            SprintDomainRules.assertStatusTransition(sprint.getStatus(), SprintStatus.ARCHIVED);
            sprint.setArchived(true);
            sprint.setStatus(SprintStatus.ARCHIVED);
        } else if (Boolean.FALSE.equals(request.archived())) {
            sprint.setArchived(false);
        }

        if (sprint.getEndDate().isBefore(sprint.getStartDate())) {
            throw new SprintValidationException("End date must be after start date");
        }

        sprint = sprintRepository.save(sprint);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sprintId", sprintId.toString());
        payload.put("actorUserId", actorId.toString());
        payload.put("previousStatus", previousStatus.name());
        payload.put("status", sprint.getStatus().name());
        eventPublisher.publish(SprintEventType.SPRINT_UPDATED, sprintId.toString(), payload);
        log.info("eventType=SPRINT_UPDATED userId={} sprintId={} result=success", actorId, sprintId);
        activityService.record(sprintId, actorId, SecurityUtils.currentUsername(),
                "SPRINT_UPDATED", "updated sprint details");

        return sprintMapper.toResponse(sprint);
    }

    /**
     * Dedicated status transition endpoint backing PATCH /{sprintId}/status, POST /start,
     * POST /complete and PATCH /archive. Publishes the specific lifecycle event for the target status.
     */
    @Transactional
    public SprintResponse updateStatus(UUID sprintId, SprintStatusUpdateRequest request) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireUpdate(sprint, actorId);

        SprintStatus previous = sprint.getStatus();
        SprintStatus target = sprintMapper.toStatus(request.status());
        SprintDomainRules.assertStatusTransition(previous, target);

        sprint.setStatus(target);
        if (target == SprintStatus.ARCHIVED) {
            sprint.setArchived(true);
        }
        sprint = sprintRepository.save(sprint);

        SprintEventType eventType = switch (target) {
            case ACTIVE -> SprintEventType.SPRINT_STARTED;
            case COMPLETED -> SprintEventType.SPRINT_COMPLETED;
            case ARCHIVED -> SprintEventType.SPRINT_ARCHIVED;
            default -> SprintEventType.SPRINT_UPDATED;
        };
        publishStatusChange(sprintId, actorId, previous, target, eventType);
        return sprintMapper.toResponse(sprint);
    }

    @Transactional
    public SprintResponse start(UUID sprintId) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireStart(sprint, actorId);

        SprintDomainRules.assertCanStart(sprint.getStatus());
        SprintStatus previous = sprint.getStatus();
        sprint.setStatus(SprintStatus.ACTIVE);
        sprint = sprintRepository.save(sprint);
        publishStatusChange(sprintId, actorId, previous, SprintStatus.ACTIVE, SprintEventType.SPRINT_STARTED);
        return sprintMapper.toResponse(sprint);
    }

    @Transactional
    public SprintResponse complete(UUID sprintId) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireComplete(sprint, actorId);

        SprintDomainRules.assertCanComplete(sprint.getStatus());
        SprintStatus previous = sprint.getStatus();
        sprint.setStatus(SprintStatus.COMPLETED);
        sprint = sprintRepository.save(sprint);
        publishStatusChange(sprintId, actorId, previous, SprintStatus.COMPLETED, SprintEventType.SPRINT_COMPLETED);
        return sprintMapper.toResponse(sprint);
    }

    @Transactional
    public SprintResponse archive(UUID sprintId) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireUpdate(sprint, actorId);

        SprintDomainRules.assertStatusTransition(sprint.getStatus(), SprintStatus.ARCHIVED);
        SprintStatus previous = sprint.getStatus();
        sprint.setStatus(SprintStatus.ARCHIVED);
        sprint.setArchived(true);
        sprint = sprintRepository.save(sprint);
        publishStatusChange(sprintId, actorId, previous, SprintStatus.ARCHIVED, SprintEventType.SPRINT_ARCHIVED);
        return sprintMapper.toResponse(sprint);
    }

    @Transactional
    public void delete(UUID sprintId) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireDelete(sprint, actorId);

        sprintRepository.deleteById(sprintId);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sprintId", sprintId.toString());
        payload.put("actorUserId", actorId.toString());
        eventPublisher.publish(SprintEventType.SPRINT_DELETED, sprintId.toString(), payload);
        log.info("eventType=SPRINT_DELETED userId={} sprintId={} result=success", actorId, sprintId);
    }

    @Transactional(readOnly = true)
    public List<VelocityPointResponse> velocityHistory(UUID projectId, Integer limit) {
        int effectiveLimit = limit == null || limit < 1 ? 6 : Math.min(limit, 50);
        return sprintRepository.findByProjectIdOrderByEndDateDesc(projectId).stream()
                .limit(effectiveLimit)
                .map(s -> new VelocityPointResponse(
                        s.getId(), s.getName(), s.getEndDate(), s.getCommittedPoints(), s.getCompletedPoints()))
                .toList();
    }

    private void publishStatusChange(
            UUID sprintId, UUID actorId, SprintStatus previous, SprintStatus current, SprintEventType eventType
    ) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sprintId", sprintId.toString());
        payload.put("actorUserId", actorId.toString());
        payload.put("previousStatus", previous.name());
        payload.put("status", current.name());
        eventPublisher.publish(eventType, sprintId.toString(), payload);
        log.info("eventType={} userId={} sprintId={} status={} result=success",
                eventType, actorId, sprintId, current);
        activityService.record(sprintId, actorId, SecurityUtils.currentUsername(),
                eventType.name(), statusChangeSummary(current));
    }

    private static String statusChangeSummary(SprintStatus current) {
        return switch (current) {
            case ACTIVE -> "started this sprint";
            case COMPLETED -> "completed this sprint";
            case ARCHIVED -> "archived this sprint";
            default -> "changed sprint status to " + current;
        };
    }

    private Sprint require(UUID sprintId) {
        return sprintRepository.findById(sprintId)
                .orElseThrow(() -> new SprintNotFoundException("Sprint not found: " + sprintId));
    }

    private static Sort resolveSort(String sort) {
        String key = sort == null || sort.isBlank() ? "newest" : sort.trim().toLowerCase(Locale.ROOT);
        return switch (key) {
            case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt");
            case "start_date" -> Sort.by(Sort.Direction.ASC, "startDate");
            case "end_date" -> Sort.by(Sort.Direction.ASC, "endDate");
            case "velocity" -> Sort.by(Sort.Direction.DESC, "velocity");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

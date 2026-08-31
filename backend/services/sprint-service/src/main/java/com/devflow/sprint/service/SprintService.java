package com.devflow.sprint.service;

import com.devflow.common.dto.PageResponse;
import com.devflow.common.security.SecurityContextUtils;
import com.devflow.sprint.dto.CreateSprintRequest;
import com.devflow.sprint.dto.SprintResponse;
import com.devflow.sprint.dto.UpdateSprintRequest;
import com.devflow.sprint.entity.Sprint;
import com.devflow.sprint.entity.SprintHealth;
import com.devflow.sprint.entity.SprintStatus;
import com.devflow.sprint.exception.SprintNotFoundException;
import com.devflow.sprint.exception.SprintValidationException;
import com.devflow.sprint.mapper.SprintMapper;
import com.devflow.sprint.repository.SprintRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final SprintMapper sprintMapper;

    public SprintService(SprintRepository sprintRepository, SprintMapper sprintMapper) {
        this.sprintRepository = sprintRepository;
        this.sprintMapper = sprintMapper;
    }

    @Transactional
    public SprintResponse create(CreateSprintRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new SprintValidationException("End date must be after start date");
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
        sprint.setCreatedBy(
                SecurityContextUtils.currentUserId()
                        .map(id -> {
                            try {
                                return UUID.fromString(id);
                            } catch (IllegalArgumentException ex) {
                                return null;
                            }
                        })
                        .orElse(null)
        );

        return sprintMapper.toResponse(sprintRepository.save(sprint));
    }

    @Transactional(readOnly = true)
    public SprintResponse get(UUID sprintId) {
        return sprintMapper.toResponse(require(sprintId));
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

    @Transactional
    public SprintResponse update(UUID sprintId, UpdateSprintRequest request) {
        Sprint sprint = require(sprintId);

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
            sprint.setStatus(sprintMapper.toStatus(request.status()));
        }
        if (request.archived() != null) {
            sprint.setArchived(request.archived());
            if (request.archived()) sprint.setStatus(SprintStatus.ARCHIVED);
        }

        if (sprint.getEndDate().isBefore(sprint.getStartDate())) {
            throw new SprintValidationException("End date must be after start date");
        }

        return sprintMapper.toResponse(sprintRepository.save(sprint));
    }

    @Transactional
    public void delete(UUID sprintId) {
        if (!sprintRepository.existsById(sprintId)) {
            throw new SprintNotFoundException("Sprint not found: " + sprintId);
        }
        sprintRepository.deleteById(sprintId);
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

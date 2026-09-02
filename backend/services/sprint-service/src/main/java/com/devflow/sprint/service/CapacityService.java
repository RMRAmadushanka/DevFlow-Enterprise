package com.devflow.sprint.service;

import com.devflow.common.api.ApiResponse;
import com.devflow.sprint.client.AssigneeAllocationResponse;
import com.devflow.sprint.client.TaskClient;
import com.devflow.sprint.dto.CapacityMemberResponse;
import com.devflow.sprint.dto.CapacityResponse;
import com.devflow.sprint.dto.SetCapacityRequest;
import com.devflow.sprint.entity.Sprint;
import com.devflow.sprint.entity.SprintMemberCapacity;
import com.devflow.sprint.exception.SprintNotFoundException;
import com.devflow.sprint.repository.SprintMemberCapacityRepository;
import com.devflow.sprint.repository.SprintRepository;
import com.devflow.sprint.security.SecurityUtils;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Capacity planning: persisted per-member capacity ({@code sprint_member_capacity}) merged at
 * read time with live per-assignee allocation from task-service. A member present on either side
 * (persisted capacity or live allocation) shows up in the merged view; the missing side defaults
 * to 0. Backs the {@code GET/PUT /api/sprints/{sprintId}/capacity} endpoints on SprintController.
 */
@Service
public class CapacityService {

    private static final Logger log = LoggerFactory.getLogger(CapacityService.class);

    private final SprintRepository sprintRepository;
    private final SprintMemberCapacityRepository capacityRepository;
    private final SprintAuthorizationService authorizationService;
    private final TaskClient taskClient;

    public CapacityService(
            SprintRepository sprintRepository,
            SprintMemberCapacityRepository capacityRepository,
            SprintAuthorizationService authorizationService,
            TaskClient taskClient
    ) {
        this.sprintRepository = sprintRepository;
        this.capacityRepository = capacityRepository;
        this.authorizationService = authorizationService;
        this.taskClient = taskClient;
    }

    @Transactional(readOnly = true)
    public CapacityResponse get(UUID sprintId) {
        Sprint sprint = require(sprintId);
        authorizationService.requireRead(sprint, SecurityUtils.requireCurrentUserId());
        return buildResponse(sprintId);
    }

    @Transactional
    public CapacityResponse set(UUID sprintId, SetCapacityRequest request) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireManageBacklog(sprint, actorId);

        for (SetCapacityRequest.Member member : request.members()) {
            SprintMemberCapacity row = capacityRepository.findBySprintIdAndUserId(sprintId, member.userId())
                    .orElseGet(() -> {
                        SprintMemberCapacity created = new SprintMemberCapacity();
                        created.setSprintId(sprintId);
                        created.setUserId(member.userId());
                        return created;
                    });
            row.setUserName(member.userName());
            row.setCapacityPoints(member.capacityPoints());
            capacityRepository.save(row);
        }

        return buildResponse(sprintId);
    }

    private CapacityResponse buildResponse(UUID sprintId) {
        List<SprintMemberCapacity> capacityRows = capacityRepository.findBySprintId(sprintId);
        Map<UUID, SprintMemberCapacity> capacityByUser = capacityRows.stream()
                .collect(Collectors.toMap(SprintMemberCapacity::getUserId, c -> c, (a, b) -> a));

        List<AssigneeAllocationResponse> allocations = fetchAllocations(sprintId);
        Map<UUID, AssigneeAllocationResponse> allocationByUser = allocations.stream()
                .filter(a -> a.assigneeId() != null)
                .collect(Collectors.toMap(AssigneeAllocationResponse::assigneeId, a -> a, (a, b) -> a));

        Set<UUID> userIds = new LinkedHashSet<>();
        userIds.addAll(capacityByUser.keySet());
        userIds.addAll(allocationByUser.keySet());

        List<CapacityMemberResponse> members = userIds.stream()
                .map(userId -> {
                    SprintMemberCapacity capacity = capacityByUser.get(userId);
                    AssigneeAllocationResponse allocation = allocationByUser.get(userId);
                    String userName = capacity != null && capacity.getUserName() != null
                            ? capacity.getUserName()
                            : (allocation != null ? allocation.assigneeName() : null);
                    return new CapacityMemberResponse(
                            userId,
                            userName,
                            capacity != null ? capacity.getCapacityPoints() : 0,
                            allocation != null ? allocation.allocatedPoints() : 0
                    );
                })
                .toList();

        return new CapacityResponse(sprintId, members);
    }

    private List<AssigneeAllocationResponse> fetchAllocations(UUID sprintId) {
        try {
            ApiResponse<List<AssigneeAllocationResponse>> response = taskClient.getSprintAllocation(sprintId);
            if (response == null || !response.success() || response.data() == null) {
                return List.of();
            }
            return response.data();
        } catch (FeignException ex) {
            log.warn("sprintId={} result=allocation_fetch_failed status={}", sprintId, ex.status());
            return List.of();
        }
    }

    private Sprint require(UUID sprintId) {
        return sprintRepository.findById(sprintId)
                .orElseThrow(() -> new SprintNotFoundException("Sprint not found: " + sprintId));
    }
}

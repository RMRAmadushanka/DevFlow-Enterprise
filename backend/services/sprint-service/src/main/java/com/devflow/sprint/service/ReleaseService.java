package com.devflow.sprint.service;

import com.devflow.sprint.dto.CreateReleaseRequest;
import com.devflow.sprint.dto.ReleaseResponse;
import com.devflow.sprint.dto.UpdateReleaseRequest;
import com.devflow.sprint.entity.Release;
import com.devflow.sprint.exception.ReleaseNotFoundException;
import com.devflow.sprint.mapper.ReleaseMapper;
import com.devflow.sprint.repository.ReleaseRepository;
import com.devflow.sprint.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Full CRUD for project releases. A release isn't owned by any one sprint (a {@link com.devflow.sprint.entity.Sprint}
 * may optionally reference one via {@code releaseId}), so authorization goes through
 * {@link SprintAuthorizationService}'s organization-scoped overloads rather than the Sprint-scoped ones.
 */
@Service
public class ReleaseService {

    private final ReleaseRepository releaseRepository;
    private final ReleaseMapper releaseMapper;
    private final SprintAuthorizationService authorizationService;

    public ReleaseService(
            ReleaseRepository releaseRepository,
            ReleaseMapper releaseMapper,
            SprintAuthorizationService authorizationService
    ) {
        this.releaseRepository = releaseRepository;
        this.releaseMapper = releaseMapper;
        this.authorizationService = authorizationService;
    }

    @Transactional
    public ReleaseResponse create(CreateReleaseRequest request) {
        UUID actorId = SecurityUtils.requireCurrentUserId();
        if (request.organizationId() != null) {
            authorizationService.requireCreate(request.organizationId(), actorId);
        }

        Release release = new Release();
        release.setProjectId(request.projectId());
        release.setOrganizationId(request.organizationId());
        release.setName(request.name().trim());
        release.setVersion(blankToNull(request.version()));
        release.setDescription(blankToNull(request.description()));
        release.setStatus(releaseMapper.toStatus(request.status()));
        release.setReleaseDate(request.releaseDate());
        release.setFeaturesJson(releaseMapper.toFeaturesJson(request.features()));

        release = releaseRepository.save(release);
        return releaseMapper.toResponse(release);
    }

    /**
     * Not scoped by organization permission (matches SprintPlanningService.backlog(projectId),
     * the existing convention for project-scoped list endpoints that only take a projectId param).
     * Returns empty when projectId is absent instead of erroring — the frontend calls this before
     * a project scope is selected (e.g. initial render), matching the dashboard's empty-until-scoped
     * convention elsewhere in this app.
     */
    @Transactional(readOnly = true)
    public List<ReleaseResponse> list(UUID projectId) {
        if (projectId == null) {
            return List.of();
        }
        return releaseRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(releaseMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReleaseResponse get(UUID releaseId) {
        Release release = require(releaseId);
        authorizationService.requireRead(release.getOrganizationId(), SecurityUtils.requireCurrentUserId());
        return releaseMapper.toResponse(release);
    }

    @Transactional
    public ReleaseResponse update(UUID releaseId, UpdateReleaseRequest request) {
        Release release = require(releaseId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireUpdate(release.getOrganizationId(), actorId);

        if (request.name() != null && !request.name().isBlank()) {
            release.setName(request.name().trim());
        }
        if (request.version() != null) {
            release.setVersion(blankToNull(request.version()));
        }
        if (request.description() != null) {
            release.setDescription(blankToNull(request.description()));
        }
        if (request.status() != null && !request.status().isBlank()) {
            release.setStatus(releaseMapper.toStatus(request.status()));
        }
        if (request.releaseDate() != null) {
            release.setReleaseDate(request.releaseDate());
        }
        if (request.features() != null) {
            release.setFeaturesJson(releaseMapper.toFeaturesJson(request.features()));
        }

        release = releaseRepository.save(release);
        return releaseMapper.toResponse(release);
    }

    @Transactional
    public void delete(UUID releaseId) {
        Release release = require(releaseId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireDelete(release.getOrganizationId(), actorId);
        releaseRepository.deleteById(releaseId);
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Release require(UUID releaseId) {
        return releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ReleaseNotFoundException("Release not found: " + releaseId));
    }
}

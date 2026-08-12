package com.devflow.project.service;

import com.devflow.common.dto.PageResponse;
import com.devflow.common.api.ApiResponse;
import com.devflow.common.exception.NotFoundException;
import com.devflow.project.client.UserClient;
import com.devflow.project.client.UserResponse;
import com.devflow.project.dto.CreateProjectRequest;
import com.devflow.project.dto.ProjectDetailResponse;
import com.devflow.project.dto.ProjectResponse;
import com.devflow.project.dto.ProjectSummaryResponse;
import com.devflow.project.dto.ProjectTagResponse;
import com.devflow.project.dto.TransferOwnershipRequest;
import com.devflow.project.dto.UpdateProjectHealthRequest;
import com.devflow.project.dto.UpdateProjectRequest;
import com.devflow.project.dto.UpdateProjectStatusRequest;
import feign.FeignException;
import com.devflow.project.entity.MemberStatus;
import com.devflow.project.entity.Project;
import com.devflow.project.entity.ProjectFavorite;
import com.devflow.project.entity.ProjectHealth;
import com.devflow.project.entity.ProjectMember;
import com.devflow.project.entity.ProjectRole;
import com.devflow.project.entity.ProjectSettings;
import com.devflow.project.entity.ProjectStatus;
import com.devflow.project.entity.ProjectTag;
import com.devflow.project.entity.ProjectVisibility;
import com.devflow.project.events.ProjectEventPublisher;
import com.devflow.project.events.ProjectEventType;
import com.devflow.project.domain.ProjectDomainRules;
import com.devflow.project.exception.DuplicateProjectException;
import com.devflow.project.exception.InvalidProjectStatusException;
import com.devflow.project.exception.ProjectAccessDeniedException;
import com.devflow.project.exception.ProjectNotFoundException;
import com.devflow.project.mapper.ProjectMapper;
import com.devflow.project.repository.ProjectFavoriteRepository;
import com.devflow.project.repository.ProjectMemberRepository;
import com.devflow.project.repository.ProjectRepository;
import com.devflow.project.repository.ProjectSettingsRepository;
import com.devflow.project.repository.ProjectTagRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Subquery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final ProjectSettingsRepository settingsRepository;
    private final ProjectTagRepository tagRepository;
    private final ProjectFavoriteRepository favoriteRepository;
    private final ProjectMapper projectMapper;
    private final ProjectAuthorizationService authorizationService;
    private final ProjectEventPublisher eventPublisher;
    private final ProjectActivityService activityService;
    private final CurrentUserResolver currentUserResolver;
    private final SlugService slugService;
    private final UserClient userClient;

    public ProjectService(
            ProjectRepository projectRepository,
            ProjectMemberRepository memberRepository,
            ProjectSettingsRepository settingsRepository,
            ProjectTagRepository tagRepository,
            ProjectFavoriteRepository favoriteRepository,
            ProjectMapper projectMapper,
            ProjectAuthorizationService authorizationService,
            ProjectEventPublisher eventPublisher,
            ProjectActivityService activityService,
            CurrentUserResolver currentUserResolver,
            SlugService slugService,
            UserClient userClient
    ) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.settingsRepository = settingsRepository;
        this.tagRepository = tagRepository;
        this.favoriteRepository = favoriteRepository;
        this.projectMapper = projectMapper;
        this.authorizationService = authorizationService;
        this.eventPublisher = eventPublisher;
        this.activityService = activityService;
        this.currentUserResolver = currentUserResolver;
        this.slugService = slugService;
        this.userClient = userClient;
    }

    @Transactional
    public ProjectResponse create(CreateProjectRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        authorizationService.requireCreateInOrganization(request.organizationId(), actorId);

        String key = ProjectDomainRules.normalizeProjectKey(request.projectKey());
        if (projectRepository.existsByOrganizationIdAndProjectKeyIgnoreCase(request.organizationId(), key)) {
            throw new DuplicateProjectException("Project key already exists in organization: " + key);
        }

        String slug = slugService.uniqueSlug(request.organizationId(), request.name());
        ProjectVisibility visibility = request.visibility() != null
                ? request.visibility()
                : ProjectVisibility.PRIVATE;
        ProjectStatus status = request.status() != null ? request.status() : ProjectStatus.ACTIVE;
        ProjectDomainRules.assertCreatableStatus(status);

        Project project = new Project();
        project.setOrganizationId(request.organizationId());
        project.setName(request.name().trim());
        project.setSlug(slug);
        project.setDescription(request.description());
        project.setProjectKey(key);
        project.setIcon(request.icon());
        project.setStatus(status);
        project.setHealth(ProjectHealth.UNKNOWN);
        project.setVisibility(visibility);
        project.setCreatedBy(actorId);
        project = projectRepository.save(project);

        ProjectMember owner = new ProjectMember();
        owner.setProjectId(project.getId());
        owner.setUserId(actorId);
        owner.setRole(ProjectRole.PROJECT_OWNER);
        owner.setStatus(MemberStatus.ACTIVE);
        owner.setJoinedAt(Instant.now());
        memberRepository.save(owner);

        ProjectSettings settings = new ProjectSettings();
        settings.setProjectId(project.getId());
        settings.setDefaultVisibility(visibility);
        settings.setAllowMemberInvites(true);
        settings.setAllowGuestAccess(false);
        settings.setTimezone("UTC");
        settings.setDefaultProjectView(com.devflow.project.entity.ProjectView.OVERVIEW);
        settingsRepository.save(settings);

        activityService.record(
                project.getId(),
                actorId,
                ProjectEventType.PROJECT_CREATED.name(),
                "Project created",
                Map.of("name", project.getName(), "projectKey", project.getProjectKey())
        );

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("projectId", project.getId().toString());
        payload.put("organizationId", project.getOrganizationId().toString());
        payload.put("name", project.getName());
        payload.put("slug", project.getSlug());
        payload.put("projectKey", project.getProjectKey());
        payload.put("actorUserId", actorId.toString());
        eventPublisher.publish(ProjectEventType.PROJECT_CREATED, project.getId().toString(), payload);

        log.info("eventType=PROJECT_CREATED userId={} projectId={} result=success", actorId, project.getId());
        return projectMapper.toResponse(project);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProjectSummaryResponse> list(
            UUID organizationId,
            ProjectStatus status,
            ProjectHealth health,
            ProjectVisibility visibility,
            String search,
            String tag,
            Boolean favorite,
            Integer page,
            Integer size,
            String sort
    ) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Set<UUID> memberProjectIds = new HashSet<>(memberRepository.findActiveProjectIdsByUserId(actorId));

        Specification<Project> spec = buildListSpec(
                actorId, organizationId, status, health, visibility, search, tag, favorite, memberProjectIds);

        Page<Project> result = projectRepository.findAll(spec, PageSupport.pageable(page, size, PageSupport.parseSort(sort)));
        return toSummaryPage(result, actorId);
    }

    @Transactional(readOnly = true)
    public ProjectDetailResponse get(UUID projectId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = requireProject(projectId);
        authorizationService.requireRead(project, actorId);
        return toDetail(project, actorId);
    }

    @Transactional(readOnly = true)
    public ProjectSummaryResponse summary(UUID projectId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = requireProject(projectId);
        authorizationService.requireRead(project, actorId);
        return toSummary(project, actorId);
    }

    @Transactional
    public ProjectResponse update(UUID projectId, UpdateProjectRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = requireProject(projectId);
        authorizationService.requireUpdate(project, actorId);
        ProjectDomainRules.assertMutableWhenNotArchived(project.getStatus());

        if (request.name() != null) {
            project.setName(request.name().trim());
            // slug stays stable on update unless a dedicated rename/slug API is introduced
        }
        if (request.description() != null) {
            project.setDescription(request.description());
        }
        if (request.icon() != null) {
            project.setIcon(request.icon());
        }
        if (request.status() != null) {
            ProjectDomainRules.assertStatusTransition(project.getStatus(), request.status());
            project.setStatus(request.status());
        }
        if (request.health() != null) {
            project.setHealth(request.health());
        }
        if (request.visibility() != null) {
            project.setVisibility(request.visibility());
        }

        project = projectRepository.save(project);
        activityService.record(projectId, actorId, ProjectEventType.PROJECT_UPDATED.name(),
                "Project updated", Map.of());
        eventPublisher.publish(ProjectEventType.PROJECT_UPDATED, projectId.toString(), Map.of(
                "projectId", projectId.toString(),
                "actorUserId", actorId.toString()
        ));
        log.info("eventType=PROJECT_UPDATED userId={} projectId={} result=success", actorId, projectId);
        return projectMapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse updateStatus(UUID projectId, UpdateProjectStatusRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = requireProject(projectId);
        authorizationService.requireUpdate(project, actorId);

        ProjectStatus previous = project.getStatus();
        ProjectDomainRules.assertStatusTransition(previous, request.status());
        project.setStatus(request.status());
        project = projectRepository.save(project);

        Map<String, Object> payload = Map.of(
                "projectId", projectId.toString(),
                "actorUserId", actorId.toString(),
                "previousStatus", previous.name(),
                "status", project.getStatus().name()
        );
        activityService.record(projectId, actorId, ProjectEventType.PROJECT_STATUS_CHANGED.name(),
                "Project status changed", payload);
        eventPublisher.publish(ProjectEventType.PROJECT_STATUS_CHANGED, projectId.toString(), payload);
        log.info("eventType=PROJECT_STATUS_CHANGED userId={} projectId={} status={} result=success",
                actorId, projectId, project.getStatus());
        return projectMapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse updateHealth(UUID projectId, UpdateProjectHealthRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = requireProject(projectId);
        authorizationService.requireUpdate(project, actorId);
        ProjectDomainRules.assertMutableWhenNotArchived(project.getStatus());

        ProjectHealth previous = project.getHealth();
        project.setHealth(request.health());
        project = projectRepository.save(project);

        Map<String, Object> payload = Map.of(
                "projectId", projectId.toString(),
                "actorUserId", actorId.toString(),
                "previousHealth", previous.name(),
                "health", project.getHealth().name()
        );
        activityService.record(projectId, actorId, ProjectEventType.PROJECT_HEALTH_CHANGED.name(),
                "Project health changed", payload);
        eventPublisher.publish(ProjectEventType.PROJECT_HEALTH_CHANGED, projectId.toString(), payload);
        log.info("eventType=PROJECT_HEALTH_CHANGED userId={} projectId={} health={} result=success",
                actorId, projectId, project.getHealth());
        return projectMapper.toResponse(project);
    }

    /**
     * Soft-delete: archives the project (status=ARCHIVED). Prefer POST .../archive for normal flow.
     * Requires project.delete.
     */
    @Transactional
    public ProjectResponse delete(UUID projectId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = requireProject(projectId);
        authorizationService.requireDelete(project, actorId);
        softArchive(project, actorId, ProjectEventType.PROJECT_DELETED);
        return projectMapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse archive(UUID projectId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = requireProject(projectId);
        authorizationService.requireArchive(project, actorId);
        softArchive(project, actorId, ProjectEventType.PROJECT_ARCHIVED);
        return projectMapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse restore(UUID projectId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = requireProject(projectId);
        authorizationService.requireArchive(project, actorId);
        ProjectDomainRules.assertCanRestore(project.getStatus());
        project.setStatus(ProjectStatus.ACTIVE);
        project.setArchivedAt(null);
        project = projectRepository.save(project);
        activityService.record(projectId, actorId, ProjectEventType.PROJECT_RESTORED.name(),
                "Project restored", Map.of());
        eventPublisher.publish(ProjectEventType.PROJECT_RESTORED, projectId.toString(), Map.of(
                "projectId", projectId.toString(),
                "actorUserId", actorId.toString()
        ));
        log.info("eventType=PROJECT_RESTORED userId={} projectId={} result=success", actorId, projectId);
        return projectMapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse transferOwnership(UUID projectId, TransferOwnershipRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Project project = requireProject(projectId);

        boolean allowed = authorizationService.canManageMembers(project, actorId)
                || authorizationService.activeMembership(projectId, actorId)
                .map(m -> m.getRole() == ProjectRole.PROJECT_OWNER)
                .orElse(false);
        if (!allowed) {
            throw new ProjectAccessDeniedException("Missing permission to transfer ownership");
        }

        UUID newOwnerId = request.newOwnerUserId();
        verifyUserExists(newOwnerId);

        // Capture previous active owners before mutation for accurate event payload.
        List<UUID> previousOwnerIds = memberRepository.findByProjectIdAndStatus(projectId, MemberStatus.ACTIVE).stream()
                .filter(m -> m.getRole() == ProjectRole.PROJECT_OWNER)
                .map(ProjectMember::getUserId)
                .filter(id -> !id.equals(newOwnerId))
                .toList();

        ProjectMember newOwnerMembership = memberRepository.findByProjectIdAndUserId(projectId, newOwnerId)
                .orElse(null);
        if (newOwnerMembership == null) {
            newOwnerMembership = new ProjectMember();
            newOwnerMembership.setProjectId(projectId);
            newOwnerMembership.setUserId(newOwnerId);
            newOwnerMembership.setJoinedAt(Instant.now());
        }
        newOwnerMembership.setRole(ProjectRole.PROJECT_OWNER);
        newOwnerMembership.setStatus(MemberStatus.ACTIVE);
        memberRepository.save(newOwnerMembership);

        // Demote previous owners (except the new owner) to PROJECT_ADMIN
        List<ProjectMember> owners = memberRepository.findByProjectIdAndStatus(projectId, MemberStatus.ACTIVE).stream()
                .filter(m -> m.getRole() == ProjectRole.PROJECT_OWNER)
                .filter(m -> !m.getUserId().equals(newOwnerId))
                .toList();
        for (ProjectMember owner : owners) {
            owner.setRole(ProjectRole.PROJECT_ADMIN);
            memberRepository.save(owner);
        }

        String previousOwnerUserId = previousOwnerIds.isEmpty()
                ? actorId.toString()
                : previousOwnerIds.getFirst().toString();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("projectId", projectId.toString());
        payload.put("previousOwnerUserId", previousOwnerUserId);
        payload.put("previousOwnerUserIds", previousOwnerIds.stream().map(UUID::toString).toList());
        payload.put("newOwnerUserId", newOwnerId.toString());
        payload.put("actorUserId", actorId.toString());
        activityService.record(projectId, actorId, ProjectEventType.PROJECT_OWNERSHIP_TRANSFERRED.name(),
                "Ownership transferred", payload);
        eventPublisher.publish(ProjectEventType.PROJECT_OWNERSHIP_TRANSFERRED, projectId.toString(), payload);
        log.info("eventType=PROJECT_OWNERSHIP_TRANSFERRED userId={} projectId={} result=success", actorId, projectId);
        return projectMapper.toResponse(project);
    }

    private void verifyUserExists(UUID userId) {
        try {
            ApiResponse<UserResponse> response = userClient.getById(userId);
            if (response == null || !response.success() || response.data() == null) {
                throw new NotFoundException("User not found: " + userId);
            }
        } catch (FeignException.NotFound ex) {
            throw new NotFoundException("User not found: " + userId);
        }
    }

    public Project requireProject(UUID projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));
    }

    @Transactional(readOnly = true)
    public List<Project> findProjectsByIds(List<UUID> projectIds) {
        if (projectIds == null || projectIds.isEmpty()) {
            return List.of();
        }
        return projectRepository.findAllById(projectIds);
    }

    private void softArchive(Project project, UUID actorId, ProjectEventType eventType) {
        ProjectDomainRules.assertCanArchive(project.getStatus());
        project.setStatus(ProjectStatus.ARCHIVED);
        project.setArchivedAt(Instant.now());
        projectRepository.save(project);
        activityService.record(project.getId(), actorId, eventType.name(),
                eventType == ProjectEventType.PROJECT_DELETED ? "Project deleted (soft archive)" : "Project archived",
                Map.of());
        eventPublisher.publish(eventType, project.getId().toString(), Map.of(
                "projectId", project.getId().toString(),
                "actorUserId", actorId.toString()
        ));
        log.info("eventType={} userId={} projectId={} result=success", eventType, actorId, project.getId());
    }

    private Specification<Project> buildListSpec(
            UUID actorId,
            UUID organizationId,
            ProjectStatus status,
            ProjectHealth health,
            ProjectVisibility visibility,
            String search,
            String tag,
            Boolean favorite,
            Set<UUID> memberProjectIds
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Visibility: member projects OR ORGANIZATION-visible in orgs where user has project.read/org.read
            // Practical Phase 4 approach: member projects always; ORGANIZATION projects in requested org if org perms allow.
            Predicate memberPred = memberProjectIds.isEmpty()
                    ? cb.disjunction()
                    : root.get("id").in(memberProjectIds);

            Predicate orgVisible = cb.conjunction();
            if (organizationId != null) {
                Set<String> orgPerms = authorizationService.orgPermissionCodes(organizationId, actorId);
                boolean canDiscoverOrg = orgPerms.contains(ProjectAuthorizationService.PERM_READ)
                        || orgPerms.contains(ProjectAuthorizationService.ORG_PERM_READ);
                if (canDiscoverOrg) {
                    orgVisible = cb.and(
                            cb.equal(root.get("organizationId"), organizationId),
                            cb.equal(root.get("visibility"), ProjectVisibility.ORGANIZATION)
                    );
                } else {
                    orgVisible = cb.disjunction();
                }
                predicates.add(cb.equal(root.get("organizationId"), organizationId));
            } else {
                // Without org filter: only member projects (avoid scanning all orgs via Feign)
                orgVisible = cb.disjunction();
            }
            predicates.add(cb.or(memberPred, orgVisible));

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (health != null) {
                predicates.add(cb.equal(root.get("health"), health));
            }
            if (visibility != null) {
                predicates.add(cb.equal(root.get("visibility"), visibility));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("slug")), pattern),
                        cb.like(cb.lower(root.get("projectKey")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("description"), "")), pattern)
                ));
            }
            if (tag != null && !tag.isBlank()) {
                Subquery<UUID> tagSub = query.subquery(UUID.class);
                var tagRoot = tagSub.from(ProjectTag.class);
                tagSub.select(tagRoot.get("projectId"))
                        .where(cb.and(
                                cb.equal(tagRoot.get("projectId"), root.get("id")),
                                cb.equal(cb.lower(tagRoot.get("name")), tag.trim().toLowerCase(Locale.ROOT))
                        ));
                predicates.add(cb.exists(tagSub));
            }
            if (Boolean.TRUE.equals(favorite)) {
                Subquery<UUID> favSub = query.subquery(UUID.class);
                var favRoot = favSub.from(ProjectFavorite.class);
                favSub.select(favRoot.get("projectId"))
                        .where(cb.and(
                                cb.equal(favRoot.get("projectId"), root.get("id")),
                                cb.equal(favRoot.get("userId"), actorId)
                        ));
                predicates.add(cb.exists(favSub));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private PageResponse<ProjectSummaryResponse> toSummaryPage(Page<Project> page, UUID actorId) {
        List<ProjectSummaryResponse> items = summariesFor(page.getContent(), actorId);
        return new PageResponse<>(
                items,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    /**
     * Batch-load member counts, tags, and favorite flags for a project page (avoids N+1).
     */
    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> summariesFor(List<Project> projects, UUID actorId) {
        if (projects == null || projects.isEmpty()) {
            return List.of();
        }
        List<UUID> ids = projects.stream().map(Project::getId).toList();
        Map<UUID, Long> memberCounts = new HashMap<>();
        Map<UUID, List<ProjectTagResponse>> tagsByProject = new HashMap<>();
        Set<UUID> favoriteIds = new HashSet<>();

        for (Object[] row : memberRepository.countGroupedByProjectIdAndStatus(ids, MemberStatus.ACTIVE)) {
            memberCounts.put((UUID) row[0], (Long) row[1]);
        }
        tagRepository.findByProjectIdIn(ids).forEach(tag ->
                tagsByProject.computeIfAbsent(tag.getProjectId(), k -> new ArrayList<>())
                        .add(toTagResponse(tag)));
        favoriteRepository.findByUserIdAndProjectIdIn(actorId, ids)
                .forEach(f -> favoriteIds.add(f.getProjectId()));

        return projects.stream()
                .map(project -> projectMapper.toSummary(
                        project,
                        memberCounts.getOrDefault(project.getId(), 0L),
                        favoriteIds.contains(project.getId()),
                        tagsByProject.getOrDefault(project.getId(), List.of())
                ))
                .toList();
    }

    private ProjectDetailResponse toDetail(Project project, UUID actorId) {
        long memberCount = memberRepository.countByProjectIdAndStatus(project.getId(), MemberStatus.ACTIVE);
        boolean favorite = favoriteRepository.existsByProjectIdAndUserId(project.getId(), actorId);
        List<ProjectTagResponse> tags = tagRepository.findByProjectIdOrderByNameAsc(project.getId()).stream()
                .map(this::toTagResponse)
                .collect(Collectors.toList());
        return projectMapper.toDetail(project, memberCount, favorite, tags);
    }

    private ProjectSummaryResponse toSummary(Project project, UUID actorId) {
        long memberCount = memberRepository.countByProjectIdAndStatus(project.getId(), MemberStatus.ACTIVE);
        boolean favorite = favoriteRepository.existsByProjectIdAndUserId(project.getId(), actorId);
        List<ProjectTagResponse> tags = tagRepository.findByProjectIdOrderByNameAsc(project.getId()).stream()
                .map(this::toTagResponse)
                .collect(Collectors.toList());
        return projectMapper.toSummary(project, memberCount, favorite, tags);
    }

    private ProjectTagResponse toTagResponse(ProjectTag tag) {
        return new ProjectTagResponse(
                tag.getId(),
                tag.getProjectId(),
                tag.getName(),
                tag.getColor(),
                tag.getCreatedAt(),
                tag.getUpdatedAt()
        );
    }
}

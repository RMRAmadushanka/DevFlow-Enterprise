package com.devflow.organization.service;

import com.devflow.common.dto.PageResponse;
import com.devflow.common.exception.ConflictException;
import com.devflow.organization.dto.AddTeamMemberRequest;
import com.devflow.organization.dto.CreateTeamRequest;
import com.devflow.organization.dto.TeamMembershipResponse;
import com.devflow.organization.dto.TeamResponse;
import com.devflow.organization.dto.UpdateTeamRequest;
import com.devflow.organization.entity.Team;
import com.devflow.organization.entity.TeamMembership;
import com.devflow.organization.events.OrganizationEventPublisher;
import com.devflow.organization.events.TeamEventType;
import com.devflow.organization.exception.MembershipNotFoundException;
import com.devflow.organization.exception.TeamNotFoundException;
import com.devflow.organization.mapper.MembershipMapper;
import com.devflow.organization.mapper.TeamMapper;
import com.devflow.organization.repository.OrganizationMembershipRepository;
import com.devflow.organization.repository.TeamMembershipRepository;
import com.devflow.organization.repository.TeamRepository;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMembershipRepository teamMembershipRepository;
    private final OrganizationMembershipRepository organizationMembershipRepository;
    private final OrganizationService organizationService;
    private final OrganizationAuthorizationService authorizationService;
    private final TeamMapper teamMapper;
    private final MembershipMapper membershipMapper;
    private final OrganizationEventPublisher eventPublisher;
    private final CurrentUserResolver currentUserResolver;

    public TeamService(
            TeamRepository teamRepository,
            TeamMembershipRepository teamMembershipRepository,
            OrganizationMembershipRepository organizationMembershipRepository,
            OrganizationService organizationService,
            OrganizationAuthorizationService authorizationService,
            TeamMapper teamMapper,
            MembershipMapper membershipMapper,
            OrganizationEventPublisher eventPublisher,
            CurrentUserResolver currentUserResolver
    ) {
        this.teamRepository = teamRepository;
        this.teamMembershipRepository = teamMembershipRepository;
        this.organizationMembershipRepository = organizationMembershipRepository;
        this.organizationService = organizationService;
        this.authorizationService = authorizationService;
        this.teamMapper = teamMapper;
        this.membershipMapper = membershipMapper;
        this.eventPublisher = eventPublisher;
        this.currentUserResolver = currentUserResolver;
    }

    @Transactional
    public TeamResponse create(UUID organizationId, CreateTeamRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        organizationService.requireOrganization(organizationId);
        authorizationService.requirePermission(
                organizationId, actorId, OrganizationAuthorizationService.PERM_TEAM_CREATE);

        String slug = request.slug().toLowerCase();
        if (teamRepository.existsByOrganizationIdAndSlugIgnoreCase(organizationId, slug)) {
            throw new ConflictException("Team slug already exists in organization: " + slug);
        }

        Team team = new Team();
        team.setOrganizationId(organizationId);
        team.setName(request.name().trim());
        team.setSlug(slug);
        team.setDescription(request.description());
        team.setCreatedBy(actorId);
        team = teamRepository.save(team);

        eventPublisher.publishTeam(
                TeamEventType.TEAM_CREATED,
                team.getId().toString(),
                Map.of(
                        "teamId", team.getId().toString(),
                        "organizationId", organizationId.toString(),
                        "name", team.getName(),
                        "slug", team.getSlug(),
                        "createdBy", actorId.toString()
                )
        );
        return teamMapper.toResponse(team);
    }

    @Transactional(readOnly = true)
    public PageResponse<TeamResponse> listByOrganization(UUID organizationId, Integer page, Integer size) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        organizationService.requireOrganization(organizationId);
        authorizationService.requirePermission(
                organizationId, actorId, OrganizationAuthorizationService.PERM_TEAM_READ);
        Page<Team> result = teamRepository.findByOrganizationId(organizationId, PageSupport.pageable(page, size));
        return PageSupport.map(result, teamMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TeamResponse get(UUID teamId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Team team = requireTeam(teamId);
        authorizationService.requirePermission(
                team.getOrganizationId(), actorId, OrganizationAuthorizationService.PERM_TEAM_READ);
        return teamMapper.toResponse(team);
    }

    @Transactional
    public TeamResponse update(UUID teamId, UpdateTeamRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Team team = requireTeam(teamId);
        authorizationService.requirePermission(
                team.getOrganizationId(), actorId, OrganizationAuthorizationService.PERM_TEAM_UPDATE);

        if (request.name() != null) {
            team.setName(request.name().trim());
        }
        if (request.slug() != null) {
            String slug = request.slug().toLowerCase();
            if (teamRepository.existsByOrganizationIdAndSlugIgnoreCase(team.getOrganizationId(), slug)
                    && !slug.equalsIgnoreCase(team.getSlug())) {
                throw new ConflictException("Team slug already exists in organization: " + slug);
            }
            team.setSlug(slug);
        }
        if (request.description() != null) {
            team.setDescription(request.description());
        }

        team = teamRepository.save(team);
        eventPublisher.publishTeam(
                TeamEventType.TEAM_UPDATED,
                team.getId().toString(),
                Map.of(
                        "teamId", team.getId().toString(),
                        "organizationId", team.getOrganizationId().toString(),
                        "updatedBy", actorId.toString()
                )
        );
        return teamMapper.toResponse(team);
    }

    @Transactional
    public void delete(UUID teamId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Team team = requireTeam(teamId);
        authorizationService.requirePermission(
                team.getOrganizationId(), actorId, OrganizationAuthorizationService.PERM_TEAM_DELETE);

        teamMembershipRepository.deleteByTeamId(teamId);
        teamRepository.delete(team);
        eventPublisher.publishTeam(
                TeamEventType.TEAM_UPDATED,
                teamId.toString(),
                Map.of(
                        "teamId", teamId.toString(),
                        "organizationId", team.getOrganizationId().toString(),
                        "deletedBy", actorId.toString(),
                        "deleted", true
                )
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<TeamMembershipResponse> listMembers(UUID teamId, Integer page, Integer size) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Team team = requireTeam(teamId);
        authorizationService.requirePermission(
                team.getOrganizationId(), actorId, OrganizationAuthorizationService.PERM_TEAM_READ);
        Page<TeamMembership> result =
                teamMembershipRepository.findByTeamId(teamId, PageSupport.pageable(page, size));
        return PageSupport.map(result, membershipMapper::toTeamResponse);
    }

    @Transactional
    public TeamMembershipResponse addMember(UUID teamId, AddTeamMemberRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Team team = requireTeam(teamId);
        authorizationService.requirePermission(
                team.getOrganizationId(), actorId, OrganizationAuthorizationService.PERM_TEAM_MANAGE_MEMBERS);

        if (!organizationMembershipRepository.existsByOrganizationIdAndUserId(
                team.getOrganizationId(), request.userId())) {
            throw new ConflictException("User must be an organization member before joining a team");
        }
        if (teamMembershipRepository.existsByTeamIdAndUserId(teamId, request.userId())) {
            throw new ConflictException("User is already a team member");
        }

        TeamMembership membership = new TeamMembership();
        membership.setTeamId(teamId);
        membership.setUserId(request.userId());
        membership.setRole(request.role());
        membership.setJoinedAt(Instant.now());
        membership = teamMembershipRepository.save(membership);

        eventPublisher.publishTeam(
                TeamEventType.TEAM_MEMBER_ADDED,
                teamId.toString(),
                Map.of(
                        "teamId", teamId.toString(),
                        "organizationId", team.getOrganizationId().toString(),
                        "userId", request.userId().toString(),
                        "role", request.role().name(),
                        "addedBy", actorId.toString()
                )
        );
        return membershipMapper.toTeamResponse(membership);
    }

    @Transactional
    public void removeMember(UUID teamId, UUID userId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Team team = requireTeam(teamId);
        authorizationService.requirePermission(
                team.getOrganizationId(), actorId, OrganizationAuthorizationService.PERM_TEAM_MANAGE_MEMBERS);

        TeamMembership membership = teamMembershipRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new MembershipNotFoundException(team.getOrganizationId(), userId));
        teamMembershipRepository.delete(membership);

        eventPublisher.publishTeam(
                TeamEventType.TEAM_MEMBER_REMOVED,
                teamId.toString(),
                Map.of(
                        "teamId", teamId.toString(),
                        "organizationId", team.getOrganizationId().toString(),
                        "userId", userId.toString(),
                        "removedBy", actorId.toString()
                )
        );
    }

    Team requireTeam(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException(teamId));
    }
}

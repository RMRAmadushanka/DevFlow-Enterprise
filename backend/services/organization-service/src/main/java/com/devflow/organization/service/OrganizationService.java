package com.devflow.organization.service;

import com.devflow.common.dto.PageResponse;
import com.devflow.common.exception.ConflictException;
import com.devflow.common.exception.ForbiddenException;
import com.devflow.common.constant.Roles;
import com.devflow.common.security.SecurityContextUtils;
import com.devflow.organization.dto.CreateOrganizationRequest;
import com.devflow.organization.dto.OrganizationResponse;
import com.devflow.organization.dto.OrganizationSummaryResponse;
import com.devflow.organization.dto.UpdateOrganizationRequest;
import com.devflow.organization.entity.Organization;
import com.devflow.organization.entity.OrganizationMembership;
import com.devflow.organization.entity.Role;
import com.devflow.organization.enums.MembershipStatus;
import com.devflow.organization.enums.OrganizationStatus;
import com.devflow.organization.events.OrganizationEventPublisher;
import com.devflow.organization.events.OrganizationEventType;
import com.devflow.organization.exception.OrganizationNotFoundException;
import com.devflow.organization.mapper.OrganizationMapper;
import com.devflow.organization.repository.OrganizationMembershipRepository;
import com.devflow.organization.repository.OrganizationRepository;
import com.devflow.organization.repository.RoleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final RoleRepository roleRepository;
    private final OrganizationMapper organizationMapper;
    private final OrganizationAuthorizationService authorizationService;
    private final OrganizationEventPublisher eventPublisher;
    private final CurrentUserResolver currentUserResolver;

    public OrganizationService(
            OrganizationRepository organizationRepository,
            OrganizationMembershipRepository membershipRepository,
            RoleRepository roleRepository,
            OrganizationMapper organizationMapper,
            OrganizationAuthorizationService authorizationService,
            OrganizationEventPublisher eventPublisher,
            CurrentUserResolver currentUserResolver
    ) {
        this.organizationRepository = organizationRepository;
        this.membershipRepository = membershipRepository;
        this.roleRepository = roleRepository;
        this.organizationMapper = organizationMapper;
        this.authorizationService = authorizationService;
        this.eventPublisher = eventPublisher;
        this.currentUserResolver = currentUserResolver;
    }

    @Transactional
    public OrganizationResponse create(CreateOrganizationRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        String slug = request.slug().toLowerCase();
        if (organizationRepository.existsBySlugIgnoreCase(slug)) {
            throw new ConflictException("Organization slug already exists: " + slug);
        }

        Organization organization = new Organization();
        organization.setName(request.name().trim());
        organization.setSlug(slug);
        organization.setDescription(request.description());
        organization.setLogoUrl(request.logoUrl());
        organization.setStatus(OrganizationStatus.ACTIVE);
        organization.setCreatedBy(actorId);
        organization = organizationRepository.save(organization);

        Role ownerRole = roleRepository.findByCodeIgnoreCase("OWNER")
                .orElseThrow(() -> new IllegalStateException("OWNER role is not seeded"));

        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganizationId(organization.getId());
        membership.setUserId(actorId);
        membership.setRole(ownerRole);
        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setJoinedAt(Instant.now());
        membershipRepository.save(membership);

        eventPublisher.publishOrganization(
                OrganizationEventType.ORGANIZATION_CREATED,
                organization.getId().toString(),
                Map.of(
                        "organizationId", organization.getId().toString(),
                        "name", organization.getName(),
                        "slug", organization.getSlug(),
                        "createdBy", actorId.toString()
                )
        );
        eventPublisher.publishOrganization(
                OrganizationEventType.ORGANIZATION_MEMBER_ADDED,
                organization.getId().toString(),
                Map.of(
                        "organizationId", organization.getId().toString(),
                        "userId", actorId.toString(),
                        "roleCode", ownerRole.getCode()
                )
        );

        return organizationMapper.toResponse(organization);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrganizationResponse> listMine(Integer page, Integer size) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Pageable pageable = PageSupport.pageable(page, size);
        Page<Organization> result = organizationRepository.findActiveMembershipsByUserId(actorId, pageable);
        return PageSupport.map(result, organizationMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse get(UUID organizationId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Organization organization = requireOrganization(organizationId);
        authorizationService.requireRead(organizationId, actorId);
        return organizationMapper.toResponse(organization);
    }

    @Transactional
    public OrganizationResponse update(UUID organizationId, UpdateOrganizationRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Organization organization = requireOrganization(organizationId);
        authorizationService.requireUpdate(organizationId, actorId);

        if (request.name() != null) {
            organization.setName(request.name().trim());
        }
        if (request.slug() != null) {
            String slug = request.slug().toLowerCase();
            organizationRepository.findBySlugIgnoreCase(slug)
                    .filter(existing -> !existing.getId().equals(organizationId))
                    .ifPresent(existing -> {
                        throw new ConflictException("Organization slug already exists: " + slug);
                    });
            organization.setSlug(slug);
        }
        if (request.description() != null) {
            organization.setDescription(request.description());
        }
        if (request.logoUrl() != null) {
            organization.setLogoUrl(request.logoUrl());
        }
        if (request.status() != null && request.status() != OrganizationStatus.ARCHIVED) {
            organization.setStatus(request.status());
        }

        organization = organizationRepository.save(organization);
        eventPublisher.publishOrganization(
                OrganizationEventType.ORGANIZATION_UPDATED,
                organization.getId().toString(),
                Map.of(
                        "organizationId", organization.getId().toString(),
                        "updatedBy", actorId.toString()
                )
        );
        return organizationMapper.toResponse(organization);
    }

    @Transactional
    public OrganizationResponse archive(UUID organizationId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Organization organization = requireOrganization(organizationId);
        authorizationService.requireDelete(organizationId, actorId);

        organization.setStatus(OrganizationStatus.ARCHIVED);
        organization = organizationRepository.save(organization);

        eventPublisher.publishOrganization(
                OrganizationEventType.ORGANIZATION_ARCHIVED,
                organization.getId().toString(),
                Map.of(
                        "organizationId", organization.getId().toString(),
                        "archivedBy", actorId.toString()
                )
        );
        return organizationMapper.toResponse(organization);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrganizationSummaryResponse> listForUser(UUID userId, Integer page, Integer size) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        boolean allowed = actorId.equals(userId)
                || SecurityContextUtils.hasRole(Roles.PLATFORM_ADMIN)
                || SecurityContextUtils.hasRole(Roles.SUPER_ADMIN)
                || SecurityContextUtils.hasRole(Roles.ADMIN)
                || membershipRepository.isOrgAdminOfSharedOrg(actorId, userId);
        if (!allowed) {
            throw new ForbiddenException("Not allowed to list organizations for user");
        }
        Pageable pageable = PageSupport.pageable(page, size);
        Page<OrganizationMembership> memberships =
                membershipRepository.findByUserIdAndStatus(userId, MembershipStatus.ACTIVE, pageable);
        List<UUID> orgIds = memberships.getContent().stream()
                .map(OrganizationMembership::getOrganizationId)
                .toList();
        Map<UUID, Organization> orgs = organizationRepository.findAllById(orgIds).stream()
                .collect(Collectors.toMap(Organization::getId, Function.identity()));

        List<OrganizationSummaryResponse> items = memberships.getContent().stream()
                .map(m -> {
                    Organization org = orgs.get(m.getOrganizationId());
                    if (org == null) {
                        return null;
                    }
                    return new OrganizationSummaryResponse(
                            org.getId(),
                            org.getName(),
                            org.getSlug(),
                            m.getRole() != null ? m.getRole().getCode() : null
                    );
                })
                .filter(item -> item != null)
                .toList();

        return new PageResponse<>(
                items,
                memberships.getNumber(),
                memberships.getSize(),
                memberships.getTotalElements(),
                memberships.getTotalPages()
        );
    }

    Organization requireOrganization(UUID organizationId) {
        return organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(organizationId));
    }
}

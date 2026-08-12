package com.devflow.organization.service;

import com.devflow.common.dto.PageResponse;
import com.devflow.common.exception.ConflictException;
import com.devflow.common.exception.NotFoundException;
import com.devflow.organization.dto.AddMemberRequest;
import com.devflow.organization.dto.MembershipResponse;
import com.devflow.organization.dto.UpdateMemberRequest;
import com.devflow.organization.entity.OrganizationMembership;
import com.devflow.organization.entity.Role;
import com.devflow.organization.enums.MembershipStatus;
import com.devflow.organization.events.OrganizationEventPublisher;
import com.devflow.organization.events.OrganizationEventType;
import com.devflow.organization.exception.MembershipNotFoundException;
import com.devflow.organization.mapper.MembershipMapper;
import com.devflow.organization.repository.OrganizationMembershipRepository;
import com.devflow.organization.repository.RoleRepository;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class MembershipService {

    private final OrganizationMembershipRepository membershipRepository;
    private final RoleRepository roleRepository;
    private final OrganizationService organizationService;
    private final OrganizationAuthorizationService authorizationService;
    private final MembershipMapper membershipMapper;
    private final OrganizationEventPublisher eventPublisher;
    private final CurrentUserResolver currentUserResolver;

    public MembershipService(
            OrganizationMembershipRepository membershipRepository,
            RoleRepository roleRepository,
            OrganizationService organizationService,
            OrganizationAuthorizationService authorizationService,
            MembershipMapper membershipMapper,
            OrganizationEventPublisher eventPublisher,
            CurrentUserResolver currentUserResolver
    ) {
        this.membershipRepository = membershipRepository;
        this.roleRepository = roleRepository;
        this.organizationService = organizationService;
        this.authorizationService = authorizationService;
        this.membershipMapper = membershipMapper;
        this.eventPublisher = eventPublisher;
        this.currentUserResolver = currentUserResolver;
    }

    @Transactional(readOnly = true)
    public PageResponse<MembershipResponse> list(UUID organizationId, Integer page, Integer size) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        organizationService.requireOrganization(organizationId);
        authorizationService.requireRead(organizationId, actorId);
        Page<OrganizationMembership> result =
                membershipRepository.findByOrganizationId(organizationId, PageSupport.pageable(page, size));
        return PageSupport.map(result, membershipMapper::toResponse);
    }

    @Transactional
    public MembershipResponse add(UUID organizationId, AddMemberRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        organizationService.requireOrganization(organizationId);
        authorizationService.requireManageMembers(organizationId, actorId);

        if (membershipRepository.existsByOrganizationIdAndUserId(organizationId, request.userId())) {
            throw new ConflictException("User is already a member of the organization");
        }

        Role role = resolveRole(request.roleCode());
        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganizationId(organizationId);
        membership.setUserId(request.userId());
        membership.setRole(role);
        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setJoinedAt(Instant.now());
        membership = membershipRepository.save(membership);

        eventPublisher.publishOrganization(
                OrganizationEventType.ORGANIZATION_MEMBER_ADDED,
                organizationId.toString(),
                Map.of(
                        "organizationId", organizationId.toString(),
                        "userId", request.userId().toString(),
                        "roleCode", role.getCode(),
                        "addedBy", actorId.toString()
                )
        );
        return membershipMapper.toResponse(membership);
    }

    @Transactional
    public MembershipResponse update(UUID organizationId, UUID userId, UpdateMemberRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        organizationService.requireOrganization(organizationId);
        authorizationService.requireManageMembers(organizationId, actorId);

        OrganizationMembership membership = membershipRepository.findByOrganizationIdAndUserId(organizationId, userId)
                .orElseThrow(() -> new MembershipNotFoundException(organizationId, userId));

        boolean roleChanged = false;
        if (request.roleCode() != null && !request.roleCode().isBlank()) {
            Role role = resolveRole(request.roleCode());
            if (!role.getCode().equalsIgnoreCase(membership.getRole().getCode())) {
                membership.setRole(role);
                roleChanged = true;
            }
        }
        if (request.status() != null) {
            membership.setStatus(request.status());
        }

        membership = membershipRepository.save(membership);

        if (roleChanged) {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("organizationId", organizationId.toString());
            payload.put("userId", userId.toString());
            payload.put("roleCode", membership.getRole().getCode());
            payload.put("changedBy", actorId.toString());
            eventPublisher.publishOrganization(
                    OrganizationEventType.ORGANIZATION_ROLE_CHANGED,
                    organizationId.toString(),
                    payload
            );
        }
        return membershipMapper.toResponse(membership);
    }

    @Transactional
    public void remove(UUID organizationId, UUID userId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        organizationService.requireOrganization(organizationId);
        authorizationService.requireManageMembers(organizationId, actorId);

        OrganizationMembership membership = membershipRepository.findByOrganizationIdAndUserId(organizationId, userId)
                .orElseThrow(() -> new MembershipNotFoundException(organizationId, userId));

        membershipRepository.delete(membership);
        eventPublisher.publishOrganization(
                OrganizationEventType.ORGANIZATION_MEMBER_REMOVED,
                organizationId.toString(),
                Map.of(
                        "organizationId", organizationId.toString(),
                        "userId", userId.toString(),
                        "removedBy", actorId.toString()
                )
        );
    }

    Role resolveRole(String roleCode) {
        return roleRepository.findByCodeIgnoreCase(roleCode)
                .orElseThrow(() -> new NotFoundException("Role not found: " + roleCode));
    }
}

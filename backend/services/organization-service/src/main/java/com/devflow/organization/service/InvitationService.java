package com.devflow.organization.service;

import com.devflow.common.dto.PageResponse;
import com.devflow.common.exception.ForbiddenException;
import com.devflow.common.exception.ConflictException;
import com.devflow.common.security.SecurityContextUtils;
import com.devflow.organization.dto.CreateInvitationRequest;
import com.devflow.organization.dto.InvitationResponse;
import com.devflow.organization.dto.MembershipResponse;
import com.devflow.organization.entity.Invitation;
import com.devflow.organization.entity.OrganizationMembership;
import com.devflow.organization.entity.Role;
import com.devflow.organization.enums.InvitationStatus;
import com.devflow.organization.enums.MembershipStatus;
import com.devflow.organization.events.InvitationEventType;
import com.devflow.organization.events.OrganizationEventPublisher;
import com.devflow.organization.events.OrganizationEventType;
import com.devflow.organization.exception.InvitationNotFoundException;
import com.devflow.organization.mapper.MembershipMapper;
import com.devflow.organization.repository.InvitationRepository;
import com.devflow.organization.repository.OrganizationMembershipRepository;
import com.devflow.organization.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
public class InvitationService {

    private static final Logger log = LoggerFactory.getLogger(InvitationService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final InvitationRepository invitationRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final RoleRepository roleRepository;
    private final OrganizationService organizationService;
    private final OrganizationAuthorizationService authorizationService;
    private final MembershipMapper membershipMapper;
    private final OrganizationEventPublisher eventPublisher;
    private final CurrentUserResolver currentUserResolver;

    public InvitationService(
            InvitationRepository invitationRepository,
            OrganizationMembershipRepository membershipRepository,
            RoleRepository roleRepository,
            OrganizationService organizationService,
            OrganizationAuthorizationService authorizationService,
            MembershipMapper membershipMapper,
            OrganizationEventPublisher eventPublisher,
            CurrentUserResolver currentUserResolver
    ) {
        this.invitationRepository = invitationRepository;
        this.membershipRepository = membershipRepository;
        this.roleRepository = roleRepository;
        this.organizationService = organizationService;
        this.authorizationService = authorizationService;
        this.membershipMapper = membershipMapper;
        this.eventPublisher = eventPublisher;
        this.currentUserResolver = currentUserResolver;
    }

    @Transactional
    public InvitationResponse create(UUID organizationId, CreateInvitationRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        organizationService.requireOrganization(organizationId);
        authorizationService.requireManageMembers(organizationId, actorId);

        roleRepository.findByCodeIgnoreCase(request.roleCode())
                .orElseThrow(() -> new InvitationNotFoundException("Role not found: " + request.roleCode()));

        String rawToken = generateToken();
        String tokenHash = sha256Hex(rawToken);

        Invitation invitation = new Invitation();
        invitation.setOrganizationId(organizationId);
        invitation.setEmail(request.email().trim().toLowerCase());
        invitation.setRoleCode(request.roleCode().toUpperCase());
        invitation.setTokenHash(tokenHash);
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setExpiresAt(Instant.now().plus(request.expiresInDays(), ChronoUnit.DAYS));
        invitation.setInvitedBy(actorId);
        invitation = invitationRepository.save(invitation);

        log.info("invitationId={} organizationId={} email={} result=created",
                invitation.getId(), organizationId, invitation.getEmail());

        eventPublisher.publishInvitation(
                InvitationEventType.INVITATION_CREATED,
                invitation.getId().toString(),
                Map.of(
                        "invitationId", invitation.getId().toString(),
                        "organizationId", organizationId.toString(),
                        "email", invitation.getEmail(),
                        "roleCode", invitation.getRoleCode(),
                        "invitedBy", actorId.toString()
                )
        );

        return toResponse(invitation, rawToken);
    }

    @Transactional(readOnly = true)
    public PageResponse<InvitationResponse> list(UUID organizationId, Integer page, Integer size) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        organizationService.requireOrganization(organizationId);
        authorizationService.requireManageMembers(organizationId, actorId);
        Page<Invitation> result =
                invitationRepository.findByOrganizationId(organizationId, PageSupport.pageable(page, size));
        return PageSupport.map(result, inv -> toResponse(inv, null));
    }

    @Transactional
    public void revoke(UUID invitationId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new InvitationNotFoundException(invitationId));
        authorizationService.requireManageMembers(invitation.getOrganizationId(), actorId);

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new ConflictException("Only pending invitations can be revoked");
        }
        invitation.setStatus(InvitationStatus.REVOKED);
        invitationRepository.save(invitation);

        eventPublisher.publishInvitation(
                InvitationEventType.INVITATION_REVOKED,
                invitation.getId().toString(),
                Map.of(
                        "invitationId", invitation.getId().toString(),
                        "organizationId", invitation.getOrganizationId().toString(),
                        "revokedBy", actorId.toString()
                )
        );
    }

    @Transactional
    public MembershipResponse accept(String rawToken) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        String jwtEmail = SecurityContextUtils.currentEmail()
                .orElseThrow(() -> new ForbiddenException("JWT email claim is required to accept invitations"));

        String tokenHash = sha256Hex(rawToken);
        Invitation invitation = invitationRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvitationNotFoundException("Invitation not found for token"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new ConflictException("Invitation is not pending");
        }
        if (invitation.getExpiresAt().isBefore(Instant.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new ConflictException("Invitation has expired");
        }
        if (!invitation.getEmail().equalsIgnoreCase(jwtEmail)) {
            throw new ForbiddenException("Invitation email does not match authenticated user");
        }

        if (membershipRepository.existsByOrganizationIdAndUserId(invitation.getOrganizationId(), actorId)) {
            throw new ConflictException("User is already a member of the organization");
        }

        Role role = roleRepository.findByCodeIgnoreCase(invitation.getRoleCode())
                .orElseThrow(() -> new InvitationNotFoundException("Role not found: " + invitation.getRoleCode()));

        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganizationId(invitation.getOrganizationId());
        membership.setUserId(actorId);
        membership.setRole(role);
        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setJoinedAt(Instant.now());
        membership = membershipRepository.save(membership);

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(Instant.now());
        invitationRepository.save(invitation);

        eventPublisher.publishInvitation(
                InvitationEventType.INVITATION_ACCEPTED,
                invitation.getId().toString(),
                Map.of(
                        "invitationId", invitation.getId().toString(),
                        "organizationId", invitation.getOrganizationId().toString(),
                        "userId", actorId.toString()
                )
        );
        eventPublisher.publishOrganization(
                OrganizationEventType.ORGANIZATION_MEMBER_ADDED,
                invitation.getOrganizationId().toString(),
                Map.of(
                        "organizationId", invitation.getOrganizationId().toString(),
                        "userId", actorId.toString(),
                        "roleCode", role.getCode(),
                        "source", "invitation"
                )
        );

        return membershipMapper.toResponse(membership);
    }

    public static String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }

    private static String generateToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private static InvitationResponse toResponse(Invitation invitation, String rawToken) {
        return new InvitationResponse(
                invitation.getId(),
                invitation.getOrganizationId(),
                invitation.getEmail(),
                invitation.getRoleCode(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                invitation.getInvitedBy(),
                invitation.getCreatedAt(),
                invitation.getAcceptedAt(),
                rawToken
        );
    }
}

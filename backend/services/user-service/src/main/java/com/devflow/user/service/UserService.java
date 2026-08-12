package com.devflow.user.service;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.constant.Roles;
import com.devflow.common.dto.PageResponse;
import com.devflow.common.exception.ForbiddenException;
import com.devflow.common.exception.UnauthorizedException;
import com.devflow.common.security.SecurityContextUtils;
import com.devflow.user.client.OrganizationClient;
import com.devflow.user.dto.CreateUserRequest;
import com.devflow.user.dto.OrganizationSummaryResponse;
import com.devflow.user.dto.UpdateUserRequest;
import com.devflow.user.dto.UserResponse;
import com.devflow.user.entity.User;
import com.devflow.user.entity.UserStatus;
import com.devflow.user.events.UserEventPublisher;
import com.devflow.user.events.UserEventType;
import com.devflow.user.exception.DuplicateUserException;
import com.devflow.user.exception.UserNotFoundException;
import com.devflow.user.mapper.UserMapper;
import com.devflow.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserEventPublisher userEventPublisher;
    private final OrganizationClient organizationClient;

    public UserService(
            UserRepository userRepository,
            UserMapper userMapper,
            UserEventPublisher userEventPublisher,
            OrganizationClient organizationClient
    ) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.userEventPublisher = userEventPublisher;
        this.organizationClient = organizationClient;
    }

    /**
     * Upserts the authenticated caller from JWT claims (sub is the identity key).
     */
    @Transactional
    public UserResponse getOrCreateCurrentUser() {
        String externalIdentityId = requireCurrentExternalIdentityId();
        Jwt jwt = SecurityContextUtils.currentJwt()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));

        CreateUserRequest fromJwt = new CreateUserRequest(
                externalIdentityId,
                firstNonBlank(jwt.getClaimAsString("preferred_username"), jwt.getClaimAsString("email")),
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("given_name"),
                jwt.getClaimAsString("family_name"),
                null
        );
        return upsertFromExternalIdentity(fromJwt);
    }

    /**
     * Idempotent upsert by Keycloak {@code sub} (externalIdentityId). Publishes USER_CREATED when new.
     * If Keycloak reissues a new {@code sub} for the same email (realm reset), relinks the existing row.
     */
    @Transactional
    public UserResponse upsertFromExternalIdentity(CreateUserRequest request) {
        if (request.externalIdentityId() == null || request.externalIdentityId().isBlank()) {
            throw new IllegalArgumentException("externalIdentityId is required");
        }

        return userRepository.findByExternalIdentityId(request.externalIdentityId())
                .map(existing -> {
                    if (existing.getStatus() == UserStatus.DELETED) {
                        throw new UserNotFoundException("User not found");
                    }
                    boolean changed = syncIdentityFields(existing, request);
                    if (changed) {
                        User saved = userRepository.save(existing);
                        userEventPublisher.publish(UserEventType.USER_UPDATED, saved);
                        log.info("eventType=USER_UPDATED userId={} externalIdentityId={} result=ok",
                                saved.getId(), saved.getExternalIdentityId());
                        return userMapper.toResponse(saved);
                    }
                    return userMapper.toResponse(existing);
                })
                .orElseGet(() -> relinkByEmailOrCreate(request));
    }

    private UserResponse relinkByEmailOrCreate(CreateUserRequest request) {
        if (request.email() != null && !request.email().isBlank()) {
            Optional<User> byEmail = userRepository.findByEmailIgnoreCaseAndStatusNot(
                    request.email().trim(), UserStatus.DELETED);
            if (byEmail.isPresent()) {
                User existing = byEmail.get();
                String previousExternalId = existing.getExternalIdentityId();
                existing.setExternalIdentityId(request.externalIdentityId());
                syncIdentityFields(existing, request);
                User saved = userRepository.save(existing);
                userEventPublisher.publish(UserEventType.USER_UPDATED, saved);
                log.info(
                        "eventType=USER_RELINKED userId={} previousExternalIdentityId={} externalIdentityId={} result=ok",
                        saved.getId(), previousExternalId, saved.getExternalIdentityId());
                return userMapper.toResponse(saved);
            }
        }
        return create(request);
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByExternalIdentityId(request.externalIdentityId())) {
            throw new DuplicateUserException(
                    "User already exists for externalIdentityId=" + request.externalIdentityId());
        }
        User user = userMapper.toEntity(request);
        User saved = userRepository.save(user);
        userEventPublisher.publish(UserEventType.USER_CREATED, saved);
        log.info("eventType=USER_CREATED userId={} externalIdentityId={} result=ok",
                saved.getId(), saved.getExternalIdentityId());
        return userMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public UserResponse getById(UUID userId) {
        User user = requireActiveUser(userId);
        assertSelfOrAdmin(user);
        return userMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getByExternalIdentityId(String externalIdentityId) {
        User user = userRepository.findByExternalIdentityIdAndStatusNot(externalIdentityId, UserStatus.DELETED)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        assertSelfOrAdmin(user);
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse update(UUID userId, UpdateUserRequest request) {
        User user = requireActiveUser(userId);
        applyUpdate(user, request);
        User saved = userRepository.save(user);
        if (saved.getStatus() == UserStatus.INACTIVE
                || saved.getStatus() == UserStatus.SUSPENDED
                || saved.getStatus() == UserStatus.DELETED) {
            userEventPublisher.publish(UserEventType.USER_DEACTIVATED, saved);
            log.info("eventType=USER_DEACTIVATED userId={} status={} result=ok",
                    saved.getId(), saved.getStatus());
        } else {
            userEventPublisher.publish(UserEventType.USER_UPDATED, saved);
            log.info("eventType=USER_UPDATED userId={} result=ok", saved.getId());
        }
        return userMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrganizationSummaryResponse> getOrganizationsForUser(UUID userId) {
        User target = requireActiveUser(userId);
        assertSelfOrAdmin(target);

        try {
            ApiResponse<PageResponse<OrganizationSummaryResponse>> response =
                    organizationClient.getOrganizationsForUser(userId);
            if (response == null || !response.success() || response.data() == null) {
                return emptyOrgPage();
            }
            return response.data();
        } catch (Exception ex) {
            log.warn("eventType=ORG_LOOKUP userId={} result=failed reason={}",
                    userId, ex.getMessage());
            return emptyOrgPage();
        }
    }

    public User requireActiveUser(UUID userId) {
        return userRepository.findByIdAndStatusNot(userId, UserStatus.DELETED)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public User requireCurrentActiveUser() {
        String externalIdentityId = requireCurrentExternalIdentityId();
        return userRepository.findByExternalIdentityIdAndStatusNot(externalIdentityId, UserStatus.DELETED)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private String requireCurrentExternalIdentityId() {
        return SecurityContextUtils.currentUserId()
                .filter(id -> !id.isBlank())
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
    }

    private void assertSelfOrAdmin(User target) {
        String currentExternalId = requireCurrentExternalIdentityId();
        boolean self = currentExternalId.equals(target.getExternalIdentityId());
        boolean admin = SecurityContextUtils.hasRole(Roles.PLATFORM_ADMIN)
                || SecurityContextUtils.hasRole(Roles.SUPER_ADMIN)
                || SecurityContextUtils.hasRole(Roles.ADMIN);
        if (!self && !admin) {
            throw new ForbiddenException("Access denied");
        }
    }

    private boolean syncIdentityFields(User user, CreateUserRequest request) {
        boolean changed = false;
        if (request.username() != null && !request.username().isBlank()
                && !request.username().equals(user.getUsername())) {
            user.setUsername(request.username().trim());
            changed = true;
        }
        if (request.email() != null && !request.email().isBlank()
                && !request.email().equals(user.getEmail())) {
            user.setEmail(request.email().trim());
            changed = true;
        }
        if (request.firstName() != null && !request.firstName().isBlank()
                && !request.firstName().equals(user.getFirstName())) {
            user.setFirstName(request.firstName().trim());
            changed = true;
        }
        if (request.lastName() != null && !request.lastName().isBlank()
                && !request.lastName().equals(user.getLastName())) {
            user.setLastName(request.lastName().trim());
            changed = true;
        }
        if ((user.getDisplayName() == null || user.getDisplayName().isBlank())
                && request.displayName() != null && !request.displayName().isBlank()) {
            user.setDisplayName(request.displayName().trim());
            changed = true;
        }
        return changed;
    }

    private void applyUpdate(User user, UpdateUserRequest request) {
        if (request.username() != null) {
            user.setUsername(blankToNull(request.username()));
        }
        if (request.email() != null) {
            user.setEmail(blankToNull(request.email()));
        }
        if (request.firstName() != null) {
            user.setFirstName(blankToNull(request.firstName()));
        }
        if (request.lastName() != null) {
            user.setLastName(blankToNull(request.lastName()));
        }
        if (request.displayName() != null) {
            user.setDisplayName(blankToNull(request.displayName()));
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(blankToNull(request.avatarUrl()));
        }
        if (request.timezone() != null) {
            user.setTimezone(blankToNull(request.timezone()));
        }
        if (request.locale() != null) {
            user.setLocale(blankToNull(request.locale()));
        }
        if (request.status() != null) {
            user.setStatus(request.status());
        }
    }

    private static PageResponse<OrganizationSummaryResponse> emptyOrgPage() {
        return new PageResponse<>(Collections.emptyList(), 0, 0, 0, 0);
    }

    private static String firstNonBlank(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        if (fallback != null && !fallback.isBlank()) {
            return fallback;
        }
        return null;
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}

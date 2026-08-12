package com.devflow.user.service;

import com.devflow.common.exception.ForbiddenException;
import com.devflow.user.client.OrganizationClient;
import com.devflow.user.dto.CreateUserRequest;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserEventPublisher userEventPublisher;
    @Mock
    private OrganizationClient organizationClient;

    private UserMapper userMapper;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userMapper = new UserMapper();
        userService = new UserService(userRepository, userMapper, userEventPublisher, organizationClient);
    }

    @AfterEach
    void clearSecurity() {
        SecurityContextHolder.clearContext();
    }

    private static void authenticateAs(String subject) {
        Jwt jwt = Jwt.withTokenValue("test-token")
                .header("alg", "none")
                .subject(subject)
                .issuedAt(Instant.parse("2026-01-01T00:00:00Z"))
                .expiresAt(Instant.parse("2026-01-01T01:00:00Z"))
                .build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt, List.of()));
    }

    @Test
    void createPersistsAndPublishesUserCreated() {
        CreateUserRequest request = new CreateUserRequest(
                "kc-sub-1", "alice", "alice@devflow.local", "Alice", "Wonder", null);
        when(userRepository.existsByExternalIdentityId("kc-sub-1")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            // simulate UUID generation
            try {
                var idField = user.getClass().getSuperclass().getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(user, UUID.fromString("11111111-1111-1111-1111-111111111111"));
            } catch (ReflectiveOperationException ex) {
                throw new IllegalStateException(ex);
            }
            return user;
        });

        UserResponse response = userService.create(request);

        assertEquals("kc-sub-1", response.externalIdentityId());
        assertEquals("alice", response.username());
        assertEquals("alice@devflow.local", response.email());

        ArgumentCaptor<UserEventType> typeCaptor = ArgumentCaptor.forClass(UserEventType.class);
        verify(userEventPublisher).publish(typeCaptor.capture(), any(User.class));
        assertEquals(UserEventType.USER_CREATED, typeCaptor.getValue());
    }

    @Test
    void createDuplicateIdentityThrows() {
        when(userRepository.existsByExternalIdentityId("kc-sub-1")).thenReturn(true);

        assertThrows(DuplicateUserException.class, () -> userService.create(
                new CreateUserRequest("kc-sub-1", "alice", "alice@devflow.local", null, null, null)));
        verify(userRepository, never()).save(any());
    }

    @Test
    void getByIdReturnsUserForSelf() {
        UUID id = UUID.fromString("22222222-2222-2222-2222-222222222222");
        User user = new User();
        user.setExternalIdentityId("kc-sub-2");
        user.setUsername("bob");
        user.setEmail("bob@devflow.local");
        user.setStatus(UserStatus.ACTIVE);
        setId(user, id);

        when(userRepository.findByIdAndStatusNot(id, UserStatus.DELETED)).thenReturn(Optional.of(user));
        authenticateAs("kc-sub-2");

        UserResponse response = userService.getById(id);
        assertEquals(id, response.id());
        assertEquals("bob", response.username());
    }

    @Test
    void getByIdForbiddenForOtherUser() {
        UUID id = UUID.fromString("22222222-2222-2222-2222-222222222222");
        User user = new User();
        user.setExternalIdentityId("kc-sub-2");
        user.setUsername("bob");
        user.setEmail("bob@devflow.local");
        user.setStatus(UserStatus.ACTIVE);
        setId(user, id);

        when(userRepository.findByIdAndStatusNot(id, UserStatus.DELETED)).thenReturn(Optional.of(user));
        authenticateAs("kc-sub-other");

        assertThrows(ForbiddenException.class, () -> userService.getById(id));
    }

    @Test
    void getByIdMissingThrows() {
        UUID id = UUID.randomUUID();
        when(userRepository.findByIdAndStatusNot(id, UserStatus.DELETED)).thenReturn(Optional.empty());
        assertThrows(UserNotFoundException.class, () -> userService.getById(id));
    }

    @Test
    void updateChangesProfileFields() {
        UUID id = UUID.fromString("33333333-3333-3333-3333-333333333333");
        User user = new User();
        user.setExternalIdentityId("kc-sub-3");
        user.setUsername("carol");
        user.setStatus(UserStatus.ACTIVE);
        setId(user, id);

        when(userRepository.findByIdAndStatusNot(id, UserStatus.DELETED)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.update(id, new UpdateUserRequest(
                null, null, "Carol", "Danvers", "Carol D", null, "UTC", "en-US", null));

        assertEquals("Carol", response.firstName());
        assertEquals("Danvers", response.lastName());
        assertEquals("Carol D", response.displayName());
        assertEquals("UTC", response.timezone());
        verify(userEventPublisher).publish(UserEventType.USER_UPDATED, user);
    }

    @Test
    void upsertFromExternalIdentityIsIdempotent() {
        User existing = new User();
        existing.setExternalIdentityId("kc-sub-4");
        existing.setUsername("dave");
        existing.setEmail("dave@devflow.local");
        existing.setStatus(UserStatus.ACTIVE);
        setId(existing, UUID.fromString("44444444-4444-4444-4444-444444444444"));

        when(userRepository.findByExternalIdentityId("kc-sub-4")).thenReturn(Optional.of(existing));

        UserResponse response = userService.upsertFromExternalIdentity(
                new CreateUserRequest("kc-sub-4", "dave", "dave@devflow.local", null, null, null));

        assertEquals("dave", response.username());
        verify(userRepository, never()).save(any());
        verify(userEventPublisher, never()).publish(any(), any());
    }

    @Test
    void upsertRelinksExistingEmailWhenKeycloakSubChanges() {
        User existing = new User();
        existing.setExternalIdentityId("old-sub");
        existing.setUsername("dave");
        existing.setEmail("dave@devflow.local");
        existing.setStatus(UserStatus.ACTIVE);
        setId(existing, UUID.fromString("55555555-5555-5555-5555-555555555555"));

        when(userRepository.findByExternalIdentityId("new-sub")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCaseAndStatusNot("dave@devflow.local", UserStatus.DELETED))
                .thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.upsertFromExternalIdentity(
                new CreateUserRequest("new-sub", "dave", "dave@devflow.local", null, null, null));

        assertEquals("new-sub", response.externalIdentityId());
        assertEquals("dave@devflow.local", response.email());
        verify(userEventPublisher).publish(UserEventType.USER_UPDATED, existing);
    }

    private static void setId(User user, UUID id) {
        try {
            var idField = user.getClass().getSuperclass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, id);
        } catch (ReflectiveOperationException ex) {
            throw new IllegalStateException(ex);
        }
    }
}

package com.devflow.user.controller;

import com.devflow.common.dto.PageResponse;
import com.devflow.common.exception.GlobalExceptionHandler;
import com.devflow.user.config.SecurityConfig;
import com.devflow.user.dto.UserResponse;
import com.devflow.user.entity.UserStatus;
import com.devflow.user.service.UserPreferenceService;
import com.devflow.user.service.UserProfileService;
import com.devflow.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        UserController.class,
        UserProfileController.class,
        UserPreferenceController.class,
        HealthController.class
})
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private UserProfileService userProfileService;

    @MockBean
    private UserPreferenceService userPreferenceService;

    @MockBean
    private JwtDecoder jwtDecoder;

    @Test
    void healthIsPublic() throws Exception {
        mockMvc.perform(get("/api/v1/user/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.service").value("user-service"))
                .andExpect(jsonPath("$.data.phase").value("3-user"));
    }

    @Test
    void meRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void meReturnsCurrentUser() throws Exception {
        UUID id = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        when(userService.getOrCreateCurrentUser()).thenReturn(sampleUser(id, "sub-123"));

        mockMvc.perform(get("/api/users/me")
                        .with(jwt()
                                .jwt(j -> j.subject("sub-123")
                                        .claim("preferred_username", "developer")
                                        .claim("email", "developer@devflow.local")
                                        .claim("given_name", "Avery")
                                        .claim("family_name", "Chen"))
                                .authorities(new SimpleGrantedAuthority("ROLE_DEVELOPER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(id.toString()))
                .andExpect(jsonPath("$.data.externalIdentityId").value("sub-123"))
                .andExpect(jsonPath("$.data.username").value("developer"));
    }

    @Test
    void getByIdReturnsUser() throws Exception {
        UUID id = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        when(userService.getById(id)).thenReturn(sampleUser(id, "sub-456"));

        mockMvc.perform(get("/api/users/{userId}", id)
                        .with(jwt().jwt(j -> j.subject("sub-456"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(id.toString()));
    }

    @Test
    void organizationsAllowedForSelf() throws Exception {
        UUID id = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
        when(userService.getOrganizationsForUser(id))
                .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0));

        mockMvc.perform(get("/api/users/{userId}/organizations", id)
                        .with(jwt().jwt(j -> j.subject("sub-self"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void byExternalIdRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/users/by-external-id/sub-999"))
                .andExpect(status().isUnauthorized());
    }

    private static UserResponse sampleUser(UUID id, String externalId) {
        Instant now = Instant.parse("2026-01-01T00:00:00Z");
        return new UserResponse(
                id,
                externalId,
                "developer",
                "developer@devflow.local",
                "Avery",
                "Chen",
                "Avery Chen",
                null,
                "UTC",
                "en-US",
                UserStatus.ACTIVE,
                "system",
                true,
                true,
                now,
                now
        );
    }
}

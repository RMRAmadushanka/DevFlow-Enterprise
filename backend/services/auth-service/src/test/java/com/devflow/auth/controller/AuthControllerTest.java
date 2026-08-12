package com.devflow.auth.controller;

import com.devflow.auth.config.SecurityConfig;
import com.devflow.auth.dto.CurrentUserResponse;
import com.devflow.auth.dto.LogoutResponse;
import com.devflow.auth.service.AuthService;
import com.devflow.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtDecoder jwtDecoder;

    @Test
    void healthIsPublic() throws Exception {
        mockMvc.perform(get("/api/auth/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.service").value("auth-service"));
    }

    @Test
    void meRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void meReturnsCurrentUser() throws Exception {
        when(authService.currentUser()).thenReturn(new CurrentUserResponse(
                "sub-123",
                "developer",
                "developer@devflow.local",
                "Avery",
                "Chen",
                List.of("DEVELOPER"),
                true
        ));

        mockMvc.perform(get("/api/auth/me")
                        .with(jwt()
                                .jwt(j -> j.subject("sub-123")
                                        .claim("preferred_username", "developer")
                                        .claim("email", "developer@devflow.local"))
                                .authorities(new SimpleGrantedAuthority("ROLE_DEVELOPER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value("sub-123"))
                .andExpect(jsonPath("$.data.username").value("developer"))
                .andExpect(jsonPath("$.data.roles[0]").value("DEVELOPER"));
    }

    @Test
    void adminPingForbiddenForDeveloper() throws Exception {
        mockMvc.perform(get("/api/auth/admin/ping")
                        .with(jwt()
                                .jwt(j -> j.subject("sub-123"))
                                .authorities(new SimpleGrantedAuthority("ROLE_DEVELOPER"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
    }

    @Test
    void adminPingAllowedForAdmin() throws Exception {
        mockMvc.perform(get("/api/auth/admin/ping")
                        .with(jwt()
                                .jwt(j -> j.subject("admin-1"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.scope").value("admin"));
    }

    @Test
    void logoutReturnsKeycloakUrl() throws Exception {
        when(authService.logout(any())).thenReturn(new LogoutResponse(
                true,
                "ok",
                "http://localhost:8180/realms/devflow/protocol/openid-connect/logout"
        ));

        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(jwt().jwt(j -> j.subject("sub-123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.success").value(true))
                .andExpect(jsonPath("$.data.keycloakLogoutUrl").exists());

        verify(authService).logout(any());
    }
}

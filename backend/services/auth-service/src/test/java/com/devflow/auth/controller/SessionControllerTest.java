package com.devflow.auth.controller;

import com.devflow.auth.config.SecurityConfig;
import com.devflow.auth.dto.AuthSessionResponse;
import com.devflow.auth.service.SessionService;
import com.devflow.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = SessionController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class SessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SessionService sessionService;

    @MockBean
    private JwtDecoder jwtDecoder;

    @Test
    void statusAnonymous() throws Exception {
        when(sessionService.status()).thenReturn(new AuthSessionResponse(false, null, null, List.of()));

        mockMvc.perform(get("/api/auth/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.authenticated").value(false));
    }

    @Test
    void statusAuthenticated() throws Exception {
        when(sessionService.status()).thenReturn(
                new AuthSessionResponse(true, "sub-1", "developer", List.of("DEVELOPER")));

        mockMvc.perform(get("/api/auth/status").with(jwt().jwt(j -> j.subject("sub-1"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.authenticated").value(true))
                .andExpect(jsonPath("$.data.userId").value("sub-1"));
    }
}

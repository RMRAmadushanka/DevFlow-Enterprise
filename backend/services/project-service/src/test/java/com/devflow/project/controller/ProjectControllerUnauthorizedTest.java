package com.devflow.project.controller;

import com.devflow.project.config.SecurityConfig;
import com.devflow.project.service.ProjectService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProjectController.class)
@Import(SecurityConfig.class)
class ProjectControllerUnauthorizedTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProjectService projectService;

    @MockBean
    private JwtDecoder jwtDecoder;

    private final UUID projectId = UUID.randomUUID();

    @Test
    void listRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/projects/{id}", projectId))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void statusPatchRequiresAuthentication() throws Exception {
        mockMvc.perform(patch("/api/projects/{id}/status", projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ON_HOLD\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void healthPatchRequiresAuthentication() throws Exception {
        mockMvc.perform(patch("/api/projects/{id}/health", projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"health\":\"AT_RISK\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void authenticatedListIsAllowed() throws Exception {
        when(projectService.list(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(null);
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk());
        verify(projectService).list(any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    @WithMockUser
    void authenticatedStatusPatchIsAllowed() throws Exception {
        when(projectService.updateStatus(eq(projectId), any())).thenReturn(null);
        mockMvc.perform(patch("/api/projects/{id}/status", projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ON_HOLD\"}"))
                .andExpect(status().isOk());
        verify(projectService).updateStatus(eq(projectId), any());
    }
}

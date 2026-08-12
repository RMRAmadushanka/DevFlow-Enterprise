package com.devflow.project.service;

import com.devflow.project.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SlugServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private SlugService slugService;

    @Test
    void toSlugNormalizesName() {
        assertThat(SlugService.toSlug("My E-Commerce Platform")).isEqualTo("my-e-commerce-platform");
        assertThat(SlugService.toSlug("  API!!! ")).isEqualTo("api");
    }

    @Test
    void uniqueSlugAppendsSuffixWhenTaken() {
        UUID orgId = UUID.randomUUID();
        when(projectRepository.existsByOrganizationIdAndSlugIgnoreCase(eq(orgId), eq("acme")))
                .thenReturn(true);
        when(projectRepository.existsByOrganizationIdAndSlugIgnoreCase(eq(orgId), eq("acme-2")))
                .thenReturn(false);

        assertThat(slugService.uniqueSlug(orgId, "Acme")).isEqualTo("acme-2");
    }
}

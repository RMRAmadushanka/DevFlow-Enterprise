package com.devflow.project.repository;

import com.devflow.project.entity.MemberStatus;
import com.devflow.project.entity.Project;
import com.devflow.project.entity.ProjectHealth;
import com.devflow.project.entity.ProjectMember;
import com.devflow.project.entity.ProjectRole;
import com.devflow.project.entity.ProjectSettings;
import com.devflow.project.entity.ProjectStatus;
import com.devflow.project.entity.ProjectView;
import com.devflow.project.entity.ProjectVisibility;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Flyway + repository integration against PostgreSQL.
 * Skipped automatically when Docker is unavailable.
 */
@DataJpaTest
@Testcontainers(disabledWithoutDocker = true)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProjectRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("devflow_project")
            .withUsername("devflow")
            .withPassword("devflow");

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.properties.hibernate.jdbc.time_zone", () -> "UTC");
    }

    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private ProjectMemberRepository memberRepository;
    @Autowired
    private ProjectSettingsRepository settingsRepository;

    @Test
    void flywayCreatesProjectAndEnforcesUniqueKey() {
        UUID orgId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Project project = newProject(orgId, userId, "API", "api-gateway", "API Gateway");
        project = projectRepository.saveAndFlush(project);

        ProjectMember owner = new ProjectMember();
        owner.setProjectId(project.getId());
        owner.setUserId(userId);
        owner.setRole(ProjectRole.PROJECT_OWNER);
        owner.setStatus(MemberStatus.ACTIVE);
        owner.setJoinedAt(Instant.now());
        memberRepository.saveAndFlush(owner);

        ProjectSettings settings = new ProjectSettings();
        settings.setProjectId(project.getId());
        settings.setDefaultVisibility(ProjectVisibility.PRIVATE);
        settings.setAllowMemberInvites(true);
        settings.setAllowGuestAccess(false);
        settings.setTimezone("UTC");
        settings.setDefaultProjectView(ProjectView.OVERVIEW);
        settingsRepository.saveAndFlush(settings);

        assertThat(projectRepository.existsByOrganizationIdAndProjectKeyIgnoreCase(orgId, "API")).isTrue();
        assertThat(memberRepository.countByProjectIdAndRoleAndStatus(
                project.getId(), ProjectRole.PROJECT_OWNER, MemberStatus.ACTIVE)).isEqualTo(1);

        Project duplicate = newProject(orgId, userId, "API", "api-gateway-2", "API 2");
        assertThatThrownBy(() -> projectRepository.saveAndFlush(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void filterByOrganizationAndStatusSupportsPagination() {
        UUID orgId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        projectRepository.saveAndFlush(newProject(orgId, userId, "ONE", "one", "One"));
        Project two = newProject(orgId, userId, "TWO", "two", "Two");
        two.setStatus(ProjectStatus.ON_HOLD);
        projectRepository.saveAndFlush(two);

        Specification<Project> spec = (root, query, cb) -> cb.and(
                cb.equal(root.get("organizationId"), orgId),
                cb.equal(root.get("status"), ProjectStatus.ACTIVE)
        );
        Page<Project> page = projectRepository.findAll(spec, PageRequest.of(0, 10));
        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().getFirst().getProjectKey()).isEqualTo("ONE");
    }

    @Test
    void optimisticLockVersionIncrementsOnUpdate() {
        UUID orgId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Project project = projectRepository.saveAndFlush(newProject(orgId, userId, "VER", "ver", "Versioned"));
        Long v0 = project.getVersion();

        project.setDescription("updated");
        project = projectRepository.saveAndFlush(project);
        assertThat(project.getVersion()).isGreaterThan(v0);
    }

    private static Project newProject(UUID orgId, UUID userId, String key, String slug, String name) {
        Project project = new Project();
        project.setOrganizationId(orgId);
        project.setCreatedBy(userId);
        project.setName(name);
        project.setSlug(slug);
        project.setProjectKey(key);
        project.setStatus(ProjectStatus.ACTIVE);
        project.setHealth(ProjectHealth.UNKNOWN);
        project.setVisibility(ProjectVisibility.PRIVATE);
        return project;
    }
}

package com.devflow.user.repository;

import com.devflow.user.entity.User;
import com.devflow.user.entity.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@Testcontainers(disabledWithoutDocker = true)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("devflow_user")
            .withUsername("devflow")
            .withPassword("devflow");

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }

    @Autowired
    private UserRepository userRepository;

    @Test
    void saveAndFindByExternalIdentityId() {
        User user = new User();
        user.setExternalIdentityId("it-sub-1");
        user.setUsername("integration");
        user.setEmail("integration@devflow.local");
        user.setStatus(UserStatus.ACTIVE);

        User saved = userRepository.save(user);

        assertTrue(userRepository.findByExternalIdentityId("it-sub-1").isPresent());
        assertEquals(saved.getId(), userRepository.findByExternalIdentityIdAndStatusNot(
                "it-sub-1", UserStatus.DELETED).orElseThrow().getId());
    }
}

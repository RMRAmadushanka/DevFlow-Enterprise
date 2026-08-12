package com.devflow.project.domain;

import com.devflow.project.entity.ProjectStatus;
import com.devflow.project.exception.InvalidProjectStatusException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProjectDomainRulesTest {

    @Test
    void normalizeProjectKeyUppercasesAndValidates() {
        assertThat(ProjectDomainRules.normalizeProjectKey("dev")).isEqualTo("DEV");
        assertThatThrownBy(() -> ProjectDomainRules.normalizeProjectKey("d"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> ProjectDomainRules.normalizeProjectKey("bad-key"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void tagColorValidation() {
        assertThat(ProjectDomainRules.isValidTagColor("#AABBCC")).isTrue();
        assertThat(ProjectDomainRules.isValidTagColor("#fff")).isFalse();
        assertThat(ProjectDomainRules.isValidTagColor("red")).isFalse();
    }

    @Test
    void cannotCreateArchived() {
        assertThatThrownBy(() -> ProjectDomainRules.assertCreatableStatus(ProjectStatus.ARCHIVED))
                .isInstanceOf(InvalidProjectStatusException.class);
    }

    @Test
    void archiveAndRestoreRules() {
        ProjectDomainRules.assertCanArchive(ProjectStatus.ACTIVE);
        assertThatThrownBy(() -> ProjectDomainRules.assertCanArchive(ProjectStatus.ARCHIVED))
                .isInstanceOf(InvalidProjectStatusException.class);

        ProjectDomainRules.assertCanRestore(ProjectStatus.ARCHIVED);
        assertThatThrownBy(() -> ProjectDomainRules.assertCanRestore(ProjectStatus.ACTIVE))
                .isInstanceOf(InvalidProjectStatusException.class);
    }

    @Test
    void statusTransitionRejectsArchiveViaPatch() {
        assertThatThrownBy(() ->
                ProjectDomainRules.assertStatusTransition(ProjectStatus.ACTIVE, ProjectStatus.ARCHIVED))
                .isInstanceOf(InvalidProjectStatusException.class);
        assertThatThrownBy(() ->
                ProjectDomainRules.assertStatusTransition(ProjectStatus.ARCHIVED, ProjectStatus.ACTIVE))
                .isInstanceOf(InvalidProjectStatusException.class);
        ProjectDomainRules.assertStatusTransition(ProjectStatus.ACTIVE, ProjectStatus.ON_HOLD);
    }
}

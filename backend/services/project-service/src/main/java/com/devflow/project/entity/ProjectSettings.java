package com.devflow.project.entity;

import com.devflow.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.util.UUID;

@Entity
@Table(name = "project_settings")
public class ProjectSettings extends BaseEntity {

    @Column(name = "project_id", nullable = false, unique = true)
    private UUID projectId;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_visibility", nullable = false, length = 32)
    private ProjectVisibility defaultVisibility;

    @Column(name = "allow_member_invites", nullable = false)
    private boolean allowMemberInvites = true;

    @Column(name = "allow_guest_access", nullable = false)
    private boolean allowGuestAccess = false;

    @Column(nullable = false, length = 64)
    private String timezone = "UTC";

    @Enumerated(EnumType.STRING)
    @Column(name = "default_project_view", nullable = false, length = 32)
    private ProjectView defaultProjectView = ProjectView.OVERVIEW;

    @Version
    @Column(nullable = false)
    private Long version;

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public ProjectVisibility getDefaultVisibility() {
        return defaultVisibility;
    }

    public void setDefaultVisibility(ProjectVisibility defaultVisibility) {
        this.defaultVisibility = defaultVisibility;
    }

    public boolean isAllowMemberInvites() {
        return allowMemberInvites;
    }

    public void setAllowMemberInvites(boolean allowMemberInvites) {
        this.allowMemberInvites = allowMemberInvites;
    }

    public boolean isAllowGuestAccess() {
        return allowGuestAccess;
    }

    public void setAllowGuestAccess(boolean allowGuestAccess) {
        this.allowGuestAccess = allowGuestAccess;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public ProjectView getDefaultProjectView() {
        return defaultProjectView;
    }

    public void setDefaultProjectView(ProjectView defaultProjectView) {
        this.defaultProjectView = defaultProjectView;
    }

    public Long getVersion() {
        return version;
    }
}

package com.devflow.project.entity;

/**
 * PRIVATE / TEAM: members only in Phase 4 (TEAM association deferred).
 * ORGANIZATION: members or org users with project.read.
 */
public enum ProjectVisibility {
    PRIVATE,
    ORGANIZATION,
    TEAM
}

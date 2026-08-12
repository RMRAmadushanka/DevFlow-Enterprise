package com.devflow.auth.integration;

/**
 * Integration boundary for Phase 3 User Service.
 * <p>
 * Keycloak {@code sub} is the stable external identity. Application profiles
 * must key off {@code externalIdentityId}, never email alone.
 */
public interface UserProfileService {

    /**
     * Ensures an application user profile exists for the Keycloak subject.
     * Phase 2: no-op / stub. Phase 3: create-or-update via user-service.
     */
    void ensureProfileExists(String externalIdentityId, String email, String username);
}

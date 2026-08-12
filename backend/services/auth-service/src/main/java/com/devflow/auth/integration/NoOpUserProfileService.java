package com.devflow.auth.integration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Phase 2 stub — User Service provisioning arrives in Phase 3.
 */
@Service
public class NoOpUserProfileService implements UserProfileService {

    private static final Logger log = LoggerFactory.getLogger(NoOpUserProfileService.class);

    @Override
    public void ensureProfileExists(String externalIdentityId, String email, String username) {
        log.debug("UserProfileService stub — ensureProfileExists externalIdentityId={} username={}",
                externalIdentityId, username);
    }
}

package com.devflow.organization.exception;

import com.devflow.common.exception.NotFoundException;

import java.util.UUID;

public class MembershipNotFoundException extends NotFoundException {

    public MembershipNotFoundException(UUID organizationId, UUID userId) {
        super("Membership not found for organization " + organizationId + " and user " + userId);
    }
}

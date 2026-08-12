package com.devflow.organization.exception;

import com.devflow.common.exception.NotFoundException;

import java.util.UUID;

public class OrganizationNotFoundException extends NotFoundException {

    public OrganizationNotFoundException(UUID organizationId) {
        super("Organization not found: " + organizationId);
    }
}

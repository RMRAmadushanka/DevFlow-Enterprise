package com.devflow.organization.exception;

import com.devflow.common.exception.NotFoundException;

import java.util.UUID;

public class TeamNotFoundException extends NotFoundException {

    public TeamNotFoundException(UUID teamId) {
        super("Team not found: " + teamId);
    }
}

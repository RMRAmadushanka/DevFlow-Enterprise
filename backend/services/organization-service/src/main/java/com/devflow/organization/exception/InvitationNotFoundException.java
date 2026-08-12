package com.devflow.organization.exception;

import com.devflow.common.exception.NotFoundException;

import java.util.UUID;

public class InvitationNotFoundException extends NotFoundException {

    public InvitationNotFoundException(UUID invitationId) {
        super("Invitation not found: " + invitationId);
    }

    public InvitationNotFoundException(String message) {
        super(message);
    }
}

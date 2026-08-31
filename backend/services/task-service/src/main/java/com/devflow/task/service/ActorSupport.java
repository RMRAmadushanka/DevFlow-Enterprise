package com.devflow.task.service;

import com.devflow.common.security.SecurityContextUtils;

import java.util.UUID;

final class ActorSupport {

    private ActorSupport() {
    }

    static UUID currentUserIdOrNull() {
        return SecurityContextUtils.currentUserId()
                .map(ActorSupport::parseUuidOrNull)
                .orElse(null);
    }

    static String currentName() {
        return SecurityContextUtils.currentUsername().orElse("User");
    }

    static String currentEmailOrNull() {
        return SecurityContextUtils.currentEmail().orElse(null);
    }

    private static UUID parseUuidOrNull(String value) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}

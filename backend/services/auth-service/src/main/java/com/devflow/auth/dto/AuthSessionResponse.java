package com.devflow.auth.dto;

import java.util.List;

public record AuthSessionResponse(
        boolean authenticated,
        String userId,
        String username,
        List<String> roles
) {
}

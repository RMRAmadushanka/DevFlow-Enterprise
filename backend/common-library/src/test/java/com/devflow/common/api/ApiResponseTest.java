package com.devflow.common.api;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiResponseTest {

    @Test
    void okWrapsPayload() {
        ApiResponse<String> response = ApiResponse.ok("pong");
        assertTrue(response.success());
        assertEquals("pong", response.data());
    }
}

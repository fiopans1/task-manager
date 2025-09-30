package com.taskmanager.application.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/**
 * Tests for HealthCheckRestController
 */
public class HealthCheckRestControllerTest extends BaseControllerTest {

    @Test
    @DisplayName("Should return OK status for health check")
    void testHealthCheck() throws Exception {
        mockMvc.perform(get("/health")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return health check response with status")
    void testHealthCheckResponse() throws Exception {
        mockMvc.perform(get("/health")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").exists());
    }

    @Test
    @DisplayName("Health endpoint should be publicly accessible")
    void testHealthCheckPublicAccess() throws Exception {
        // Should not require authentication
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should handle multiple health check requests")
    void testMultipleHealthChecks() throws Exception {
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(get("/health"))
                    .andExpect(status().isOk());
        }
    }

    @Test
    @DisplayName("Health check should respond quickly")
    void testHealthCheckPerformance() throws Exception {
        long startTime = System.currentTimeMillis();
        
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk());
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        // Health check should respond in less than 1 second
        assert(duration < 1000);
    }
}

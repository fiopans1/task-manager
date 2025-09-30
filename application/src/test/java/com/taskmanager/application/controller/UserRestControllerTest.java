package com.taskmanager.application.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.application.model.entities.AuthProvider;
import com.taskmanager.application.model.entities.Role;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.respository.UserRepository;

/**
 * Integration tests for UserRestController
 */
public class UserRestControllerTest extends BaseControllerTest {

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setAge(25);
        testUser.setProvider(AuthProvider.LOCAL);
        testUser.setCreatedDate(new Date());

        Role userRole = new Role();
        userRole.setId(1L);
        userRole.setName("USER");
        testUser.setRoles(Arrays.asList(userRole));

        // Setup admin user
        adminUser = new User();
        adminUser.setId(2L);
        adminUser.setUsername("adminuser");
        adminUser.setEmail("admin@example.com");
        adminUser.setAge(30);
        adminUser.setProvider(AuthProvider.LOCAL);
        adminUser.setCreatedDate(new Date());

        Role adminRole = new Role();
        adminRole.setId(2L);
        adminRole.setName("ADMIN");
        adminUser.setRoles(Arrays.asList(userRole, adminRole));
    }

    @Test
    @DisplayName("Should get current user info")
    void testGetCurrentUser() throws Exception {
        // Arrange
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer " + generateMockToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.age").value(25));

        verify(authService).getCurrentUser();
    }

    @Test
    @DisplayName("Should return 401 when accessing user info without authentication")
    void testGetCurrentUser_Unauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should get user by username")
    void testGetUserByUsername() throws Exception {
        // Arrange
        when(authService.hasRole("ADMIN")).thenReturn(true);
        when(authService.getCurrentUser()).thenReturn(adminUser);

        // Act & Assert
        mockMvc.perform(get("/api/users/username/testuser")
                .header("Authorization", "Bearer " + generateMockToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    @DisplayName("Should return 403 when non-admin tries to access user by username")
    void testGetUserByUsername_Forbidden() throws Exception {
        // Arrange
        when(authService.hasRole("ADMIN")).thenReturn(false);
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(get("/api/users/username/testuser")
                .header("Authorization", "Bearer " + generateMockToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should get all users when admin")
    void testGetAllUsers_Admin() throws Exception {
        // Arrange
        List<User> users = Arrays.asList(testUser, adminUser);
        when(authService.hasRole("ADMIN")).thenReturn(true);
        when(authService.getCurrentUser()).thenReturn(adminUser);

        // Act & Assert
        mockMvc.perform(get("/api/users")
                .header("Authorization", "Bearer " + generateMockToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Should return 403 when non-admin tries to list all users")
    void testGetAllUsers_Forbidden() throws Exception {
        // Arrange
        when(authService.hasRole("ADMIN")).thenReturn(false);
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(get("/api/users")
                .header("Authorization", "Bearer " + generateMockToken()))
                .andExpect(status().isForbidden());
    }

    /**
     * Helper method to generate a mock JWT token for testing
     */
    private String generateMockToken() {
        return "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxNzEyNTI2MDAwLCJyb2xlcyI6IlVTRVIifQ.mock";
    }
}

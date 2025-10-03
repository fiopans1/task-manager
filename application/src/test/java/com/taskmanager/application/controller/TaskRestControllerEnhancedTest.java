package com.taskmanager.application.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
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
import com.taskmanager.application.model.dto.ActionTaskDTO;
import com.taskmanager.application.model.dto.TaskDTO;
import com.taskmanager.application.model.entities.ActionTask;
import com.taskmanager.application.model.entities.ActionType;
import com.taskmanager.application.model.entities.PriorityTask;
import com.taskmanager.application.model.entities.StateTask;
import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.service.TaskService;

/**
 * Comprehensive tests for TaskRestController
 */
public class TaskRestControllerEnhancedTest extends BaseControllerTest {

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private Task testTask;
    private TaskDTO testTaskDTO;
    private ActionTask testAction;
    private ActionTaskDTO testActionDTO;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        // Setup test task
        testTask = new Task();
        testTask.setId(1L);
        testTask.setNameOfTask("Test Task");
        testTask.setDescriptionOfTask("Test Description");
        testTask.setState(StateTask.NEW);
        testTask.setPriority(PriorityTask.MEDIUM);
        testTask.setUser(testUser);
        testTask.setCreationDate(new Date());

        // Setup test task DTO
        testTaskDTO = new TaskDTO();
        testTaskDTO.setNameOfTask("New Task");
        testTaskDTO.setDescriptionOfTask("New Description");
        testTaskDTO.setState(StateTask.NEW);
        testTaskDTO.setPriority(PriorityTask.HIGH);

        // Setup test action
        testAction = new ActionTask();
        testAction.setId(1L);
        testAction.setActionName("Test Action");
        testAction.setActionDescription("Test Action Description");
        testAction.setActionType(ActionType.COMMENT);
        testAction.setUser("testuser");
        testAction.setActionDate(new Date());
        testAction.setTask(testTask);

        // Setup test action DTO
        testActionDTO = new ActionTaskDTO();
        testActionDTO.setActionName("New Action");
        testActionDTO.setActionDescription("New Action Description");
        testActionDTO.setActionType(ActionType.COMMENT);
    }

    @Test
    @DisplayName("Should get all tasks for authenticated user")
    void testGetAllTasks() throws Exception {
        // Arrange
        List<Task> tasks = Arrays.asList(testTask);
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(get("/api/tasks/tasks")
                .header("Authorization", "Bearer " + generateMockToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Should create a new task")
    void testCreateTask() throws Exception {
        // Arrange
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(post("/api/tasks/create")
                .header("Authorization", "Bearer " + generateMockToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testTaskDTO)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get task by id")
    void testGetTaskById() throws Exception {
        // Arrange
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(get("/api/tasks/1")
                .header("Authorization", "Bearer " + generateMockToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    @DisplayName("Should update existing task")
    void testUpdateTask() throws Exception {
        // Arrange
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(post("/api/tasks/update/1")
                .header("Authorization", "Bearer " + generateMockToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testTaskDTO)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete task by id")
    void testDeleteTask() throws Exception {
        // Arrange
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(delete("/api/tasks/delete/1")
                .header("Authorization", "Bearer " + generateMockToken()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get all actions for a task")
    void testGetTaskActions() throws Exception {
        // Arrange
        List<ActionTask> actions = Arrays.asList(testAction);
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(get("/api/tasks/1/actions")
                .header("Authorization", "Bearer " + generateMockToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Should create action for a task")
    void testCreateTaskAction() throws Exception {
        // Arrange
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(post("/api/tasks/1/actions")
                .header("Authorization", "Bearer " + generateMockToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testActionDTO)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should update action for a task")
    void testUpdateTaskAction() throws Exception {
        // Arrange
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(put("/api/tasks/1/actions/1")
                .header("Authorization", "Bearer " + generateMockToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testActionDTO)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete action from a task")
    void testDeleteTaskAction() throws Exception {
        // Arrange
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(delete("/api/tasks/1/actions/1")
                .header("Authorization", "Bearer " + generateMockToken()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return 401 when accessing tasks without authentication")
    void testGetTasksUnauthorized() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should return 404 when task not found")
    void testGetTaskNotFound() throws Exception {
        // Arrange
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(get("/api/tasks/999")
                .header("Authorization", "Bearer " + generateMockToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return 400 when creating task with invalid data")
    void testCreateTaskInvalidData() throws Exception {
        // Arrange
        TaskDTO invalidTaskDTO = new TaskDTO();
        // Missing required fields
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(post("/api/tasks/create")
                .header("Authorization", "Bearer " + generateMockToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidTaskDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should get events for calendar")
    void testGetEvents() throws Exception {
        // Arrange
        when(authService.getCurrentUser()).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(get("/api/tasks/events/get")
                .header("Authorization", "Bearer " + generateMockToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    private String generateMockToken() {
        return "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxNzEyNTI2MDAwLCJyb2xlcyI6IlVTRVIifQ.mock";
    }
}

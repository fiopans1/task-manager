package com.taskmanager.application.integration;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Date;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.application.model.dto.TaskDTO;
import com.taskmanager.application.model.entities.AuthProvider;
import com.taskmanager.application.model.entities.PriorityTask;
import com.taskmanager.application.model.entities.StateTask;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.respository.TaskRepository;
import com.taskmanager.application.respository.UserRepository;

/**
 * Integration tests for complete Task workflow
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class TaskWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("integrationtestuser");
        testUser.setEmail("integration@test.com");
        testUser.setPassword("$2a$10$abc123");
        testUser.setAge(25);
        testUser.setAuthProviders(Set.of(AuthProvider.LOCAL));
        testUser.setCreationDate(new Date());
        testUser = userRepository.save(testUser);
    }

    @Test
    @WithMockUser(username = "integrationtestuser", roles = {"USER"})
    @DisplayName("Complete task lifecycle: create, read, update, delete")
    void testCompleteTaskLifecycle() throws Exception {
        TaskDTO newTask = new TaskDTO();
        newTask.setNameOfTask("Integration Test Task");
        newTask.setDescriptionOfTask("This is an integration test task");
        newTask.setState(StateTask.NEW);
        newTask.setPriority(PriorityTask.HIGH);

        MvcResult createResult = mockMvc.perform(post("/api/tasks/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newTask)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andReturn();

        String taskId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

        mockMvc.perform(get("/api/tasks/" + taskId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nameOfTask").value("Integration Test Task"));
    }
}

package com.taskmanager.application.controller;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Date;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

import com.taskmanager.application.model.entities.PriorityTask;
import com.taskmanager.application.model.entities.StateTask;
import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.service.TaskService;

public class TaskRestControllerTestNew extends BaseControllerTest {

    @MockBean
    private TaskService taskService;

    @Test
    @WithMockUser(username = "testuser", roles = {"USER"})
    public void getTaskById_Success() throws Exception {
        // Configurar usuario de prueba
        User testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        // Configurar tarea de prueba
        Task testTask = new Task();
        testTask.setId(1L);
        testTask.setNameOfTask("Test Task");
        testTask.setDescriptionOfTask("Test Description");
        testTask.setState(StateTask.NEW);
        testTask.setPriority(PriorityTask.MEDIUM);
        testTask.setUser(testUser);
        testTask.setCreationDate(new Date());

        // Configurar servicio mock
        when(taskService.getTaskById(anyLong())).thenReturn(testTask);
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(authService.hasRole("USER")).thenReturn(true);

        // Ejecutar prueba
        mockMvc.perform(get("/api/tasks/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nameOfTask").value("Test Task"));
    }
}

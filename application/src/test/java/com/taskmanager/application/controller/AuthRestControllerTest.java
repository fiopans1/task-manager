package com.taskmanager.application.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.HashMap;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.application.model.dto.LoginDTO;
import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.entities.User;

/**
 * Tests para el controlador AuthRestController
 */
public class AuthRestControllerTest extends BaseControllerTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void login_Success() throws Exception {
        // Crear datos de login
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setUsername("testuser");
        loginDTO.setPassword("password");

        // Crear respuesta simulada del servicio
        HashMap<String, String> response = new HashMap<>();
        response.put("token", "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6MTcxMjYxMjQwMCwiaWF0IjoxNzEyNTI2MDAwfQ.abc123");
        response.put("username", "testuser");
        response.put("email", "test@example.com");

        // Configurar servicio mock
        when(authService.login(any(LoginDTO.class))).thenReturn(response);

        // Ejecutar prueba
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    public void login_Failure() throws Exception {
        // Crear datos de login inválidos
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setUsername("testuser");
        loginDTO.setPassword("wrongpassword");

        // Crear respuesta simulada del servicio
        HashMap<String, String> response = new HashMap<>();
        response.put("error", "Invalid credentials");

        // Configurar servicio mock
        when(authService.login(any(LoginDTO.class))).thenReturn(response);

        // Ejecutar prueba
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    @Test
    public void register_Success() throws Exception {
        // Crear usuario para registrar
        User user = new User();
        user.setUsername("newuser");
        user.setEmail("newuser@example.com");
        user.setPassword("password");

        // Crear respuesta simulada del servicio
        ResponseDTO response = new ResponseDTO();
        response.addSuccessMessage("User registered successfully");
        // No necesitamos setErrorCount(0) porque ya es 0 por defecto

        // Configurar servicio mock
        when(authService.register(any(User.class))).thenReturn(response);

        // Ejecutar prueba
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successMessages[0]").value("User registered successfully"))
                .andExpect(jsonPath("$.errorCount").value(0));
    }

    @Test
    public void register_Failure() throws Exception {
        // Crear usuario con datos inválidos
        User user = new User();
        user.setUsername("test"); // username demasiado corto
        user.setEmail("invalid-email");
        user.setPassword("pwd"); // contraseña demasiado corta

        // Crear respuesta simulada del servicio
        ResponseDTO response = new ResponseDTO();
        response.addErrorMessage("Username must be at least 6 characters");
        response.addErrorMessage("Password must be at least 8 characters");
        // El contador de errores se incrementa automáticamente con addErrorMessage

        // Configurar servicio mock
        when(authService.register(any(User.class))).thenReturn(response);

        // Ejecutar prueba
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorMessages").isArray())
                .andExpect(jsonPath("$.errorCount").value(2))
                .andExpect(jsonPath("$.errorMessages[0]").exists())
                .andExpect(jsonPath("$.errorMessages[1]").exists());
    }
}

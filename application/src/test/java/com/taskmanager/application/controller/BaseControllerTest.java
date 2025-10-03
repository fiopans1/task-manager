package com.taskmanager.application.controller;

import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.service.AuthService;

/**
 * Clase base para las pruebas de controladores que proporciona la configuración
 * común necesaria para probar los controladores con seguridad JWT.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class BaseControllerTest {

    @Autowired
    protected WebApplicationContext context;

    protected MockMvc mockMvc;

    @MockBean
    protected AuthService authService;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .build();
    }

    /**
     * Configura un usuario de prueba para usar en los tests
     *
     * @param username Nombre de usuario
     * @param id ID del usuario
     * @param email Email del usuario
     * @return Usuario configurado
     */
    protected User setupTestUser(String username, Long id, String email) {
        User testUser = new User();
        testUser.setId(id);
        testUser.setUsername(username);
        testUser.setEmail(email);
        return testUser;
    }
}

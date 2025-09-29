package com.taskmanager.application.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Prueba la autenticación JWT con endpoints protegidos
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecuredEndpointTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testUnauthenticatedRequestShouldBeRejected() throws Exception {
        // Acceder a un endpoint protegido sin autenticación debería devolver 401
        mockMvc.perform(get("/api/tasks/tasks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testPublicEndpointShouldBeAccessible() throws Exception {
        // Acceder a un endpoint público debería ser permitido sin autenticación
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk());
    }
}

package com.taskmanager.application.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.application.model.dto.ListTMDTO;
import com.taskmanager.application.model.entities.ListTM;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.service.ListService;

/**
 * Pruebas para ListRestController utilizando la clase base
 */
public class ListRestControllerTest extends BaseControllerTest {

    @MockBean
    private ListService listService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    @WithMockUser(username = "testuser", roles = {"USER"})
    public void getAllListsForUser_Success() throws Exception {
        // Configurar usuario de prueba
        User testUser = setupTestUser("testuser", 1L, "test@example.com");
        
        // Configurar DTOs de respuesta
        List<ListTMDTO> testListDTOs = new ArrayList<>();
        
        ListTMDTO list1 = new ListTMDTO();
        list1.setId(1L);
        list1.setNameOfList("Lista 1");
        list1.setDescriptionOfList("Descripción de la lista 1");
        list1.setColor("#FF0000");
        testListDTOs.add(list1);
        
        ListTMDTO list2 = new ListTMDTO();
        list2.setId(2L);
        list2.setNameOfList("Lista 2");
        list2.setDescriptionOfList("Descripción de la lista 2");
        list2.setColor("#00FF00");
        testListDTOs.add(list2);
        
        // Configurar servicio mock
        when(listService.findAllListsForLoggedUser()).thenReturn(testListDTOs);
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(authService.hasRole("USER")).thenReturn(true);
        
        // Ejecutar prueba
        mockMvc.perform(get("/api/lists/lists"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1L))
            .andExpect(jsonPath("$[0].nameOfList").value("Lista 1"))
            .andExpect(jsonPath("$[1].id").value(2L))
            .andExpect(jsonPath("$[1].nameOfList").value("Lista 2"));
    }
    
    @Test
    @WithMockUser(username = "testuser", roles = {"USER"})
    public void createList_Success() throws Exception {
        // Configurar usuario de prueba
        User testUser = setupTestUser("testuser", 1L, "test@example.com");
        
        // Crear DTO para la solicitud
        ListTMDTO listDTO = new ListTMDTO();
        listDTO.setNameOfList("Nueva Lista");
        listDTO.setDescriptionOfList("Descripción de la nueva lista");
        listDTO.setColor("#0000FF");
        
        // Configurar la entidad de respuesta con todos los datos necesarios
        ListTM createdListEntity = new ListTM();
        createdListEntity.setId(3L);
        createdListEntity.setNameOfList(listDTO.getNameOfList());
        createdListEntity.setDescriptionOfList(listDTO.getDescriptionOfList());
        createdListEntity.setColor(listDTO.getColor());
        createdListEntity.setUser(testUser); // Asignar el usuario de prueba
        createdListEntity.setListElements(new ArrayList<>()); // Lista vacía de elementos
        
        // Configurar servicio mock
        when(listService.createList(any(ListTMDTO.class))).thenReturn(createdListEntity);
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(authService.hasRole("USER")).thenReturn(true);
        
        // Ejecutar prueba
        mockMvc.perform(post("/api/lists/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(listDTO)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(3L))
            .andExpect(jsonPath("$.nameOfList").value("Nueva Lista"))
            .andExpect(jsonPath("$.user").value(testUser.getUsername()));
    }
}
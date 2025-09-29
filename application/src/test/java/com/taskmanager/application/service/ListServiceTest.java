package com.taskmanager.application.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mockStatic;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;

import com.taskmanager.application.model.dto.ListElementDTO;
import com.taskmanager.application.model.dto.ListTMDTO;
import com.taskmanager.application.model.entities.ListElement;
import com.taskmanager.application.model.entities.ListTM;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.respository.ListElementRepository;
import com.taskmanager.application.respository.ListRepository;

/**
 * Tests unitarios para ListService
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class ListServiceTest {

    @Mock
    private ListRepository listRepository;

    @Mock
    private ListElementRepository listElementRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private ListService listService;

    private User testUser;
    private ListTM testList;
    private ListElement testElement;
    private ListTMDTO testListDTO;
    private ListElementDTO testElementDTO;

    @BeforeEach
    public void setup() {
        // Configurar usuario de prueba
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        // Configurar lista de prueba
        testList = new ListTM();
        testList.setId(1L);
        testList.setNameOfList("Test List");
        testList.setDescriptionOfList("Test Description");
        testList.setColor("#FF0000");
        testList.setUser(testUser);
        testList.setListElements(new ArrayList<>());

        // Configurar elemento de prueba
        testElement = new ListElement();
        testElement.setId(1L);
        testElement.setNameOfElement("Test Element");
        testElement.setDescriptionOfElement("Test Element Description");
        testElement.setCompleted(false);
        testElement.setListTM(testList);

        // Configurar DTO de lista
        testListDTO = new ListTMDTO();
        testListDTO.setId(1L);
        testListDTO.setNameOfList("Test List");
        testListDTO.setDescriptionOfList("Test Description");
        testListDTO.setColor("#FF0000");

        // Configurar DTO de elemento
        testElementDTO = new ListElementDTO();
        testElementDTO.setId(1L);
        testElementDTO.setName("Test Element");
        testElementDTO.setDescription("Test Element Description");
        testElementDTO.setCompleted(false);
    }

    @Test
    public void createList_AsRegularUser_Success() {
        // Configurar comportamiento mock
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(authService.hasRole("ADMIN")).thenReturn(false);
        when(listRepository.save(any(ListTM.class))).thenReturn(testList);

        // Ejecutar método a probar
        ListTM result = listService.createList(testListDTO);

        // Verificar resultado
        assertNotNull(result);
        assertEquals(testList.getId(), result.getId());
        assertEquals(testList.getNameOfList(), result.getNameOfList());
        assertEquals(testUser, result.getUser());

        // Verificar que se llamó al repositorio para guardar
        verify(listRepository, times(1)).save(any(ListTM.class));
    }

    @Test
    public void findAllListsForLoggedUser_Success() {
        // Configurar comportamiento mock
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(listRepository.findAllByUser(testUser)).thenReturn(Arrays.asList(testList));

        // Ejecutar método a probar
        List<ListTMDTO> result = listService.findAllListsForLoggedUser();

        // Verificar resultado
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testList.getId(), result.get(0).getId());
        assertEquals(testList.getNameOfList(), result.get(0).getNameOfList());
    }

    @Test
    public void deleteListById_Success() throws ResourceNotFoundException, NotPermissionException {
        // Configurar comportamiento mock
        when(listRepository.findById(anyLong())).thenReturn(Optional.of(testList));
        when(authService.hasRole("ADMIN")).thenReturn(false);

        try (MockedStatic<AuthService> authServiceMock = mockStatic(AuthService.class)) {
            authServiceMock.when(AuthService::getCurrentUsername).thenReturn(testUser.getUsername());

            // Ejecutar método a probar
            listService.deleteListById(1L);

            // Verificar que se llamó al repositorio para eliminar
            verify(listRepository, times(1)).deleteById(1L);
        }
    }

    @Test
    public void deleteListById_NotFound() {
        // Configurar comportamiento mock
        when(listRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Ejecutar método a probar y verificar excepción
        assertThrows(ResourceNotFoundException.class, () -> {
            listService.deleteListById(999L);
        });
    }

    @Test
    public void deleteListById_NotPermission() {
        // Crear otro usuario
        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setUsername("otheruser");

        // Configurar comportamiento mock
        when(listRepository.findById(anyLong())).thenReturn(Optional.of(testList));
        when(authService.hasRole("ADMIN")).thenReturn(false);

        try (MockedStatic<AuthService> authServiceMock = mockStatic(AuthService.class)) {
            authServiceMock.when(AuthService::getCurrentUsername).thenReturn(otherUser.getUsername());

            // Ejecutar método a probar y verificar excepción
            NotPermissionException exception = assertThrows(NotPermissionException.class, () -> {
                listService.deleteListById(1L);
            });
            assertNotNull(exception);
        }
    }

    @Test
    public void updateList_Success() throws ResourceNotFoundException, NotPermissionException {
        // Configurar comportamiento mock
        when(listRepository.findById(1L)).thenReturn(Optional.of(testList));
        when(listRepository.save(any(ListTM.class))).thenAnswer(invocation -> {
            ListTM savedList = invocation.getArgument(0);
            return savedList;
        });
        when(authService.hasRole("ADMIN")).thenReturn(false);

        // Modificar DTO para actualizar
        testListDTO.setNameOfList("Updated List Name");
        testListDTO.setColor("#00FF00");

        try (MockedStatic<AuthService> authServiceMock = mockStatic(AuthService.class)) {
            authServiceMock.when(AuthService::getCurrentUsername).thenReturn(testUser.getUsername());

            // Ejecutar método a probar
            ListTMDTO result = listService.updateList(1L, testListDTO);

            // Verificar resultado
            assertNotNull(result);
            assertEquals("Updated List Name", result.getNameOfList());
            assertEquals("#00FF00", result.getColor());
        }
    }

    @Test
    public void getListWithElementsById_Success() throws ResourceNotFoundException, NotPermissionException {
        // Añadir elemento a la lista
        testList.setListElements(Arrays.asList(testElement));

        // Configurar comportamiento mock
        when(listRepository.findById(anyLong())).thenReturn(Optional.of(testList));
        when(authService.hasRole("ADMIN")).thenReturn(false);

        try (MockedStatic<AuthService> authServiceMock = mockStatic(AuthService.class)) {
            authServiceMock.when(AuthService::getCurrentUsername).thenReturn(testUser.getUsername());

            // Ejecutar método a probar
            ListTMDTO result = listService.getListWithElementsById(1L);

            // Verificar resultado
            assertNotNull(result);
            assertEquals(testList.getId(), result.getId());
            assertNotNull(result.getListElements());
            assertEquals(1, result.getListElements().size());
        }
    }

    @Test
    public void addElementToList_Success() throws ResourceNotFoundException, NotPermissionException {
        // Configurar comportamiento mock
        when(listRepository.findById(anyLong())).thenReturn(Optional.of(testList));
        when(listElementRepository.save(any(ListElement.class))).thenReturn(testElement);
        when(authService.hasRole("ADMIN")).thenReturn(false);

        try (MockedStatic<AuthService> authServiceMock = mockStatic(AuthService.class)) {
            authServiceMock.when(AuthService::getCurrentUsername).thenReturn(testUser.getUsername());

            // Ejecutar método a probar
            ListElement result = listService.addElementToList(1L, testElementDTO);

            // Verificar resultado
            assertNotNull(result);
            assertEquals(testElement.getId(), result.getId());
            assertEquals(testElement.getNameOfElement(), result.getNameOfElement());
            assertEquals(testList, result.getListTM());
        }
    }

    @Test
    public void updateElement_Success() throws ResourceNotFoundException, NotPermissionException {
        // Configurar comportamiento mock
        when(listElementRepository.findById(anyLong())).thenReturn(Optional.of(testElement));
        when(listElementRepository.save(any(ListElement.class))).thenReturn(testElement);
        when(authService.hasRole("ADMIN")).thenReturn(false);

        // Modificar DTO para actualizar
        testElementDTO.setName("Updated Element Name");
        testElementDTO.setCompleted(true);

        try (MockedStatic<AuthService> authServiceMock = mockStatic(AuthService.class)) {
            authServiceMock.when(AuthService::getCurrentUsername).thenReturn(testUser.getUsername());

            // Ejecutar método a probar
            ListElement result = listService.updateElement(1L, testElementDTO);

            // Verificar resultado
            assertNotNull(result);
            assertEquals("Updated Element Name", result.getNameOfElement());
            assertTrue(result.isCompleted());
        }
    }

    @Test
    public void deleteElement_Success() throws ResourceNotFoundException, NotPermissionException {
        // Configurar comportamiento mock
        when(listElementRepository.findById(anyLong())).thenReturn(Optional.of(testElement));
        when(authService.hasRole("ADMIN")).thenReturn(false);

        try (MockedStatic<AuthService> authServiceMock = mockStatic(AuthService.class)) {
            authServiceMock.when(AuthService::getCurrentUsername).thenReturn(testUser.getUsername());

            // Ejecutar método a probar
            listService.deleteElement(1L);

            // Verificar que se llamó al repositorio para eliminar
            verify(listElementRepository, times(1)).deleteById(1L);
        }
    }
}

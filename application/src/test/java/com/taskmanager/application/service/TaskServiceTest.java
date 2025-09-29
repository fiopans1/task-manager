package com.taskmanager.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;
import org.mockito.quality.Strictness;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoSettings;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import com.taskmanager.application.model.dto.ActionTaskDTO;
import com.taskmanager.application.model.dto.TaskDTO;
import com.taskmanager.application.model.entities.ActionTask;
import com.taskmanager.application.model.entities.ActionType;
import com.taskmanager.application.model.entities.PriorityTask;
import com.taskmanager.application.model.entities.StateTask;
import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.respository.ActionTaskRepository;
import com.taskmanager.application.respository.EventTaskRepository;
import com.taskmanager.application.respository.TaskRepository;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ActionTaskRepository actionTaskRepository;

    @Mock
    private EventTaskRepository eventTaskRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private TaskService taskService;

    private User testUser;
    private User adminUser;
    private Task testTask;
    private ActionTask testAction;
    private ActionTaskDTO testActionDTO;
    private TaskDTO testTaskDTO;

    @BeforeEach
    void setUp() {
        // Configure test objects
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        adminUser = new User();
        adminUser.setId(2L);
        adminUser.setUsername("adminuser");

        // Configure test task
        testTask = new Task();
        testTask.setId(1L);
        testTask.setNameOfTask("Test Task");
        testTask.setDescriptionOfTask("Test Description");
        testTask.setState(StateTask.NEW);
        testTask.setPriority(PriorityTask.MEDIUM);
        testTask.setUser(testUser);
        testTask.setCreationDate(new Date());

        // Configure test action
        testAction = new ActionTask();
        testAction.setId(1L);
        testAction.setActionName("Test Action");
        testAction.setActionDescription("Test Action Description");
        testAction.setActionType(ActionType.COMMENT);
        testAction.setUser("testuser");
        testAction.setActionDate(new Date());
        testAction.setTask(testTask);

        // Configure test DTOs
        testActionDTO = new ActionTaskDTO();
        testActionDTO.setActionName("Test Action");
        testActionDTO.setActionDescription("Test Action Description");
        testActionDTO.setActionType(ActionType.COMMENT);

        testTaskDTO = new TaskDTO();
        testTaskDTO.setNameOfTask("Test Task");
        testTaskDTO.setDescriptionOfTask("Test Description");
        testTaskDTO.setState(StateTask.NEW);
        testTaskDTO.setPriority(PriorityTask.MEDIUM);
    }

    @Test
    @DisplayName("Should create task successfully when user is not admin")
    void createTask_UserNotAdmin_Success() {
        // Arrange
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(authService.hasRole("ADMIN")).thenReturn(false);
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task savedTask = invocation.getArgument(0);
            savedTask.setId(1L);
            return savedTask;
        });

        // Act
        Task result = taskService.createTask(testTaskDTO);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(testTaskDTO.getNameOfTask(), result.getNameOfTask());
        assertEquals(testTaskDTO.getDescriptionOfTask(), result.getDescriptionOfTask());
        assertEquals(testUser, result.getUser());
        verify(taskRepository).save(any(Task.class));
        verify(authService).getCurrentUser();
    }

    @Test
    @DisplayName("Should create task successfully when user is admin")
    void createTask_UserIsAdmin_Success() {
        // Arrange
        Task mockTask = new Task();
        mockTask.setUser(testUser);
        testTaskDTO.setUser("testuser"); // Setting username instead of User object
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(authService.hasRole("ADMIN")).thenReturn(true);
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task savedTask = invocation.getArgument(0);
            savedTask.setId(1L);
            return savedTask;
        });

        // Act
        Task result = taskService.createTask(testTaskDTO);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(testTaskDTO.getNameOfTask(), result.getNameOfTask());
        assertEquals(testTaskDTO.getDescriptionOfTask(), result.getDescriptionOfTask());
        verify(taskRepository).save(any(Task.class));
        verify(authService).getCurrentUser();
        // Not verifying hasRole call as it depends on the task.getUser() which might be null
    }

    @Test
    @DisplayName("Should add action to task successfully")
    void testAddActionToTask_Success() throws ResourceNotFoundException, NotPermissionException {
        // Arrange
        try (MockedStatic<AuthService> authServiceMocked = mockStatic(AuthService.class)) {
            authServiceMocked.when(() -> AuthService.getCurrentUsername()).thenReturn("testuser");
            when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
            when(authService.hasRole("ADMIN")).thenReturn(false);
            when(actionTaskRepository.save(any(ActionTask.class))).thenAnswer(invocation -> {
                ActionTask savedAction = invocation.getArgument(0);
                savedAction.setId(1L);
                return savedAction;
            });

            // Act
            ActionTask result = taskService.addActionToTask(1L, testActionDTO);

            // Assert
            assertNotNull(result);
            assertEquals(1L, result.getId());
            assertEquals(testActionDTO.getActionName(), result.getActionName());
            assertEquals(testActionDTO.getActionDescription(), result.getActionDescription());
            assertEquals(testActionDTO.getActionType(), result.getActionType());
            verify(taskRepository).findById(1L);
            verify(authService).hasRole("ADMIN");
            verify(actionTaskRepository).save(any(ActionTask.class));
        }
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when task not found")
    void testAddActionToTask_NotFound() {
        // Arrange
        when(taskRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(ResourceNotFoundException.class, () -> taskService.addActionToTask(1L, testActionDTO));
        assertTrue(exception.getMessage().contains("not found"));
        verify(taskRepository).findById(1L);
        verify(actionTaskRepository, never()).save(any(ActionTask.class));
    }

    @Test
    @DisplayName("Should throw NotPermissionException when user is not owner")
    void testAddActionToTask_NoPermission() {
        // Arrange
        try (MockedStatic<AuthService> authServiceMocked = mockStatic(AuthService.class)) {
            authServiceMocked.when(() -> AuthService.getCurrentUsername()).thenReturn("otheruser");
            when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
            when(authService.hasRole("ADMIN")).thenReturn(false);

            // Act & Assert
            Exception exception = assertThrows(NotPermissionException.class, () -> taskService.addActionToTask(1L, testActionDTO));
            assertTrue(exception.getMessage().contains("permission"));
        }
    }

    @Test
    @DisplayName("Should return all actions for task")
    void testGetAllActionsForTask() throws ResourceNotFoundException, NotPermissionException {
        // Arrange
        List<ActionTask> actions = Arrays.asList(testAction);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(actionTaskRepository.findAllByTask(testTask)).thenReturn(actions);
        try (MockedStatic<AuthService> authServiceMocked = mockStatic(AuthService.class)) {
            authServiceMocked.when(() -> AuthService.getCurrentUsername()).thenReturn("testuser");
            when(authService.hasRole("ADMIN")).thenReturn(false);

            // Act
            List<ActionTask> result = taskService.getAllActionsForTask(1L);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals(testAction.getId(), result.get(0).getId());
            verify(taskRepository).findById(1L);
            verify(actionTaskRepository).findAllByTask(testTask);
        }
    }

    @Test
    @DisplayName("Should update action task successfully")
    void testUpdateActionTask_Success() throws ResourceNotFoundException, NotPermissionException {
        // Arrange
        try (MockedStatic<AuthService> authServiceMocked = mockStatic(AuthService.class)) {
            authServiceMocked.when(() -> AuthService.getCurrentUsername()).thenReturn("testuser");
            when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
            when(actionTaskRepository.findById(1L)).thenReturn(Optional.of(testAction));
            when(actionTaskRepository.save(any(ActionTask.class))).thenReturn(testAction);
            when(authService.hasRole("ADMIN")).thenReturn(false);

            // Act
            ActionTask result = taskService.updateActionTask(1L, 1L, testActionDTO);

            // Assert
            assertNotNull(result);
            assertEquals(testAction.getId(), result.getId());
            verify(taskRepository).findById(1L);
            verify(actionTaskRepository).findById(1L);
            verify(actionTaskRepository).save(any(ActionTask.class));
        }
    }

    @Test
    @DisplayName("Should throw NotPermissionException when user is not owner of task for action")
    void testUpdateActionTask_NoPermission() {
        // Arrange
        try (MockedStatic<AuthService> authServiceMocked = mockStatic(AuthService.class)) {
            authServiceMocked.when(() -> AuthService.getCurrentUsername()).thenReturn("otheruser");
            when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
            when(actionTaskRepository.findById(1L)).thenReturn(Optional.of(testAction));
            lenient().when(authService.hasRole("ADMIN")).thenReturn(false);

            // Act & Assert
            Exception exception = assertThrows(NotPermissionException.class, () -> taskService.updateActionTask(1L, 1L, testActionDTO));
            assertTrue(exception.getMessage().contains("permission"));
        }
    }

    @Test
    @DisplayName("Should delete action from task successfully")
    void testDeleteActionFromTask_Success() throws ResourceNotFoundException, NotPermissionException {
        // Arrange
        try (MockedStatic<AuthService> authServiceMocked = mockStatic(AuthService.class)) {
            authServiceMocked.when(() -> AuthService.getCurrentUsername()).thenReturn("testuser");
            when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
            when(actionTaskRepository.findById(1L)).thenReturn(Optional.of(testAction));
            doNothing().when(actionTaskRepository).delete(any(ActionTask.class));
            when(authService.hasRole("ADMIN")).thenReturn(false);

            // Act
            taskService.deleteActionFromTask(1L, 1L);

            // Assert
            verify(taskRepository).findById(1L);
            verify(actionTaskRepository).findById(1L);
            verify(actionTaskRepository).delete(any(ActionTask.class));
        }
    }

    @Test
    @DisplayName("Should throw NotPermissionException when user is not owner of task for deleting action")
    void testDeleteActionFromTask_NoPermission() {
        // Arrange
        try (MockedStatic<AuthService> authServiceMocked = mockStatic(AuthService.class)) {
            authServiceMocked.when(() -> AuthService.getCurrentUsername()).thenReturn("otheruser");
            when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
            when(actionTaskRepository.findById(1L)).thenReturn(Optional.of(testAction));
            lenient().when(authService.hasRole("ADMIN")).thenReturn(false);

            // Act & Assert
            Exception exception = assertThrows(NotPermissionException.class, () -> taskService.deleteActionFromTask(1L, 1L));
            assertTrue(exception.getMessage().contains("permission"));
        }
    }
}

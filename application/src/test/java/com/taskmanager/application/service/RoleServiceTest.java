package com.taskmanager.application.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.taskmanager.application.model.entities.RoleOfUser;
import com.taskmanager.application.respository.RoleRepository;

/**
 * Unit tests for RoleService
 */
@ExtendWith(MockitoExtension.class)
public class RoleServiceTest {

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private RoleService roleService;

    private RoleOfUser userRole;
    private RoleOfUser adminRole;

    @BeforeEach
    void setUp() {
        // Setup user role
        userRole = new RoleOfUser();
        userRole.setId(1L);
        userRole.setName("USER");

        // Setup admin role
        adminRole = new RoleOfUser();
        adminRole.setId(2L);
        adminRole.setName("ADMIN");
    }

    @Test
    @DisplayName("Should get role by name successfully")
    void testGetRole_Success() {
        // Arrange
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));

        // Act
        RoleOfUser result = roleService.getRole("USER");

        // Assert
        assertNotNull(result);
        assertEquals("USER", result.getName());
        assertEquals(1L, result.getId());
        verify(roleRepository).findByName("USER");
    }

    @Test
    @DisplayName("Should throw exception when role not found")
    void testGetRole_NotFound() {
        // Arrange
        when(roleRepository.findByName("SUPERADMIN")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> roleService.getRole("SUPERADMIN"));
        verify(roleRepository).findByName("SUPERADMIN");
    }

    @Test
    @DisplayName("Should create new role")
    void testCreateRole() {
        // Arrange
        String roleName = "MODERATOR";
        doNothing().when(roleRepository).save(any(RoleOfUser.class));

        // Act
        roleService.createRole(roleName);

        // Assert
        verify(roleRepository).save(any(RoleOfUser.class));
    }

    @Test
    @DisplayName("Should delete role by name")
    void testDeleteRole_Success() {
        // Arrange
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
        doNothing().when(roleRepository).delete(any(RoleOfUser.class));

        // Act
        roleService.deleteRole("USER");

        // Assert
        verify(roleRepository).findByName("USER");
        verify(roleRepository).delete(userRole);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent role")
    void testDeleteRole_NotFound() {
        // Arrange
        when(roleRepository.findByName("NONEXISTENT")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> roleService.deleteRole("NONEXISTENT"));
        verify(roleRepository).findByName("NONEXISTENT");
        verify(roleRepository, never()).delete(any(RoleOfUser.class));
    }

    @Test
    @DisplayName("Should update role name")
    void testUpdateRole_Success() {
        // Arrange
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
        when(roleRepository.save(any(RoleOfUser.class))).thenReturn(userRole);

        // Act
        roleService.updateRole("USER", "POWER_USER");

        // Assert
        verify(roleRepository).findByName("USER");
        verify(roleRepository).save(any(RoleOfUser.class));
    }

    @Test
    @DisplayName("Should check if BASIC role exists")
    void testExistsBasicRole() {
        // Arrange
        when(roleRepository.existsByName("BASIC")).thenReturn(true);

        // Act
        boolean result = roleService.existsBasicRole();

        // Assert
        assertTrue(result);
        verify(roleRepository).existsByName("BASIC");
    }

    @Test
    @DisplayName("Should return false when BASIC role does not exist")
    void testExistsBasicRole_NotFound() {
        // Arrange
        when(roleRepository.existsByName("BASIC")).thenReturn(false);

        // Act
        boolean result = roleService.existsBasicRole();

        // Assert
        assertFalse(result);
        verify(roleRepository).existsByName("BASIC");
    }

    @Test
    @DisplayName("Should get BASIC role")
    void testGetBasicRole_Success() {
        // Arrange
        RoleOfUser basicRole = new RoleOfUser();
        basicRole.setId(3L);
        basicRole.setName("BASIC");
        when(roleRepository.findByName("BASIC")).thenReturn(Optional.of(basicRole));

        // Act
        RoleOfUser result = roleService.getBasicRole();

        // Assert
        assertNotNull(result);
        assertEquals("BASIC", result.getName());
        assertEquals(3L, result.getId());
        verify(roleRepository).findByName("BASIC");
    }

    @Test
    @DisplayName("Should throw exception when BASIC role not found")
    void testGetBasicRole_NotFound() {
        // Arrange
        when(roleRepository.findByName("BASIC")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> roleService.getBasicRole());
        verify(roleRepository).findByName("BASIC");
    }
}

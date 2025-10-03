package com.taskmanager.application.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.taskmanager.application.model.dto.LoginDTO;
import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.entities.AuthProvider;
import com.taskmanager.application.model.entities.RoleOfUser;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.validations.UserValidation;
import com.taskmanager.application.respository.UserRepository;

/**
 * Unit tests for AuthService
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class AuthServiceTest {

    @Mock
    private JWTUtilityService jwtUtilityService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleService roleService;

    @Mock
    private UserValidation userValidation;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private LoginDTO loginDTO;
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();

        // Setup test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setAge(25);

        RoleOfUser userRole = new RoleOfUser("USER");
        userRole.setId(1L);
        userRole.setName("USER");
        testUser.addRole(userRole);
        testUser.setAuthProviders(Set.of(AuthProvider.LOCAL));
        testUser.setCreationDate(new Date());

        // Setup login DTO
        loginDTO = new LoginDTO();
        loginDTO.setUsername("testuser");
        loginDTO.setPassword("password123");
    }

    @Test
    @DisplayName("Should successfully login with valid credentials")
    void testLogin_Success() throws Exception {
        // Arrange
        String expectedToken = "test-jwt-token";
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtUtilityService.generateJWT(testUser)).thenReturn(expectedToken);

        // Act
        HashMap<String, String> result = authService.login(loginDTO);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("token"));
        assertEquals(expectedToken, result.get("token"));
        assertFalse(result.containsKey("error"));
        verify(userRepository).findByUsername("testuser");
        verify(jwtUtilityService).generateJWT(testUser);
    }

    @Test
    @DisplayName("Should fail login with invalid password")
    void testLogin_InvalidPassword() throws Exception {
        // Arrange
        loginDTO.setPassword("wrongpassword");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        HashMap<String, String> result = authService.login(loginDTO);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("error"));
        assertEquals("Authentication failed!", result.get("error"));
        assertFalse(result.containsKey("token"));
        verify(userRepository).findByUsername("testuser");
        verify(jwtUtilityService, never()).generateJWT(any());
    }

    @Test
    @DisplayName("Should fail login when user does not exist")
    void testLogin_UserNotFound() throws Exception {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // Act
        HashMap<String, String> result = authService.login(loginDTO);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("error"));
        assertEquals("User not registered!", result.get("error"));
        assertFalse(result.containsKey("token"));
        verify(userRepository).findByUsername("testuser");
        verify(jwtUtilityService, never()).generateJWT(any());
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void testRegister_Success() throws Exception {
        // Arrange
        User newUser = new User();
        newUser.setUsername("newuser");
        newUser.setEmail("newuser@example.com");
        newUser.setPassword("password123");
        newUser.setAge(30);

        RoleOfUser userRole = new RoleOfUser("USER");
        userRole.setId(1L);
        userRole.setName("USER");

        when(userValidation.validateUser(any(User.class))).thenReturn(new ResponseDTO());
        when(roleService.existsBasicRole()).thenReturn(true);
        when(roleService.getBasicRole()).thenReturn(userRole);
        when(userRepository.save(any(User.class))).thenReturn(newUser);

        // Act
        ResponseDTO result = authService.register(newUser);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.getErrorCount());
        verify(userValidation).validateUser(newUser);
        verify(roleService).existsBasicRole();
        verify(roleService).getBasicRole();
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should return current username from SecurityContext")
    void testGetCurrentUsername() {
        // Arrange
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        SecurityContextHolder.setContext(securityContext);

        // Act
        String username = AuthService.getCurrentUsername();

        // Assert
        assertEquals("testuser", username);
    }

    @Test
    @DisplayName("Should return current user")
    void testGetCurrentUser() {
        // Arrange
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        SecurityContextHolder.setContext(securityContext);

        // Act
        User result = authService.getCurrentUser();

        // Assert
        assertNotNull(result);
        assertEquals(testUser.getId(), result.getId());
        assertEquals(testUser.getUsername(), result.getUsername());
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    @DisplayName("Should return current user roles")
    void testGetCurrentUserRoles() {
        // Arrange
        Collection<GrantedAuthority> authorities = Arrays.asList(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("ROLE_ADMIN")
        );
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);
        SecurityContextHolder.setContext(securityContext);

        // Act
        Collection<? extends GrantedAuthority> result = authService.getCurrentUserRoles();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Should correctly check if user has specific role")
    void testHasRole() {
        // Arrange
        Collection<GrantedAuthority> authorities = Arrays.asList(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("ROLE_ADMIN")
        );
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);
        SecurityContextHolder.setContext(securityContext);

        // Act & Assert
        assertTrue(authService.hasRole("ROLE_ADMIN"));
        assertTrue(authService.hasRole("ROLE_USER"));
        assertFalse(authService.hasRole("ROLE_SUPERADMIN"));
    }

    @Test
    @DisplayName("Should return empty collection when no authentication")
    void testGetCurrentUserRoles_NoAuthentication() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        // Act
        Collection<? extends GrantedAuthority> result = authService.getCurrentUserRoles();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}

package com.taskmanager.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.entities.AuthProvider;
import com.taskmanager.application.model.entities.FullName;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.validations.UserValidation;
import com.taskmanager.application.respository.UserRepository;

/**
 * Unit tests for UserValidation
 */
@ExtendWith(MockitoExtension.class)
public class UserValidationTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserValidation userValidation;

    private User validUser;

    @BeforeEach
    void setUp() {
        // Setup valid user
        validUser = new User();
        validUser.setUsername("validuser");
        validUser.setEmail("valid@example.com");
        validUser.setPassword("ValidPass123!");
        validUser.setAge(25);
        validUser.addAuthProvider(AuthProvider.LOCAL);
        
        FullName fullName = new FullName();
        fullName.setName("John");
        fullName.setSurname1("Doe");
        fullName.setSurname2("Smith");
        validUser.setName(fullName);
    }

    @Test
    @DisplayName("Should validate user successfully with all valid fields")
    void testValidate_Success() {

        // Act
        ResponseDTO result = userValidation.validateUser(validUser);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.getErrorCount());
        assertTrue(result.getSuccessMessages().isEmpty() || 
                   result.getSuccessMessages().stream().anyMatch(msg -> msg.contains("valid")));
    }

    @Test
    @DisplayName("Should fail validation when username is null")
    void testValidate_NullUsername() {
        // Arrange
        validUser.setUsername(null);

        // Act
        ResponseDTO result = userValidation.validateUser(validUser);

        // Assert
        assertNotNull(result);
        assertTrue(result.getErrorCount() > 0);
        assertTrue(result.getErrorMessages().stream()
                .anyMatch(msg -> msg.toLowerCase().contains("username")));
    }

    @Test
    @DisplayName("Should fail validation when username is empty")
    void testValidate_EmptyUsername() {
        // Arrange
        validUser.setUsername("");

        // Act
        ResponseDTO result = userValidation.validateUser(validUser);

        // Assert
        assertNotNull(result);
        assertTrue(result.getErrorCount() > 0);
    }

    @Test
    @DisplayName("Should fail validation when email is invalid")
    void testValidate_InvalidEmail() {
        // Arrange
        validUser.setEmail("invalid-email");

        // Act
        ResponseDTO result = userValidation.validateUser(validUser);

        // Assert
        assertNotNull(result);
        assertTrue(result.getErrorCount() > 0);
        assertTrue(result.getErrorMessages().stream()
                .anyMatch(msg -> msg.toLowerCase().contains("email")));
    }

    @Test
    @DisplayName("Should fail validation when password is too short")
    void testValidate_PasswordTooShort() {
        // Arrange
        validUser.setPassword("short");

        // Act
        ResponseDTO result = userValidation.validateUser(validUser);

        // Assert
        assertNotNull(result);
        assertTrue(result.getErrorCount() > 0);
        assertTrue(result.getErrorMessages().stream()
                .anyMatch(msg -> msg.toLowerCase().contains("password")));
    }

    @Test
    @DisplayName("Should fail validation when age is below minimum")
    void testValidate_AgeTooYoung() {
        // Arrange
        validUser.setAge(12);

        // Act
        ResponseDTO result = userValidation.validateUser(validUser);

        // Assert
        assertNotNull(result);
        assertTrue(result.getErrorCount() > 0);
        assertTrue(result.getErrorMessages().stream()
                .anyMatch(msg -> msg.toLowerCase().contains("age")));
    }

    @Test
    @DisplayName("Should fail validation when age is above maximum")
    void testValidate_AgeTooOld() {
        // Arrange
        validUser.setAge(150);

        // Act
        ResponseDTO result = userValidation.validateUser(validUser);

        // Assert
        assertNotNull(result);
        assertTrue(result.getErrorCount() > 0);
        assertTrue(result.getErrorMessages().stream()
                .anyMatch(msg -> msg.toLowerCase().contains("age")));
    }

    @Test
    @DisplayName("Should accumulate multiple validation errors")
    void testValidate_MultipleErrors() {
        // Arrange
        validUser.setUsername("");
        validUser.setEmail("invalid");
        validUser.setPassword("123");
        validUser.setAge(10);

        // Act
        ResponseDTO result = userValidation.validateUser(validUser);

        // Assert
        assertNotNull(result);
        assertTrue(result.getErrorCount() >= 4);
    }

    @Test
    @DisplayName("Should handle null user")
    void testValidate_NullUser() {
        // Act
        ResponseDTO result = userValidation.validateUser(null);

        // Assert
        assertNotNull(result);
        assertTrue(result.getErrorCount() > 0);
    }

    @Test
    @DisplayName("Should validate username with allowed special characters")
    void testValidate_UsernameWithSpecialChars() {
        // Arrange
        validUser.setUsername("user_name-123");
        when(userRepository.existsByUsername(any())).thenReturn(false);
        when(userRepository.existsByEmail(any())).thenReturn(false);

        // Act
        ResponseDTO result = userValidation.validateUser(validUser);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.getErrorCount());
    }

    // @Test
    // @DisplayName("Should fail validation with disallowed special characters in username")
    // void testValidate_UsernameWithInvalidChars() {
    //     // Arrange
    //     validUser.setUsername("user@name!");

    //     // Act
    //     ResponseDTO result = userValidation.validateUser(validUser);

    //     // Assert
    //     assertNotNull(result);
    //     assertTrue(result.getErrorCount() > 0);
    // }
}

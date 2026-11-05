package com.taskmanager.application.service;

import com.taskmanager.application.model.dto.ChangePasswordDTO;
import com.taskmanager.application.model.dto.ProfileDTO;
import com.taskmanager.application.model.dto.SessionDTO;
import com.taskmanager.application.model.dto.UpdateProfileDTO;
import com.taskmanager.application.model.entities.AuthProvider;
import com.taskmanager.application.model.entities.AuthSession;
import com.taskmanager.application.model.entities.FullName;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.validations.UserValidation;
import com.taskmanager.application.respository.AuthSessionRepository;
import com.taskmanager.application.respository.UserRepository;
import com.taskmanager.application.security.SessionCookieService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthSessionRepository authSessionRepository;

    @Autowired
    private UserValidation userValidation;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private SessionCookieService sessionCookieService;

    @Autowired
    private CsrfService csrfService;

    public ProfileDTO getProfile(User user) {
        return ProfileDTO.fromUser(user);
    }

    @Transactional
    public SessionDTO updateProfile(User currentUser, UpdateProfileDTO profile,
            HttpServletRequest request, HttpServletResponse response) {
        String username = trimToNull(profile.getUsername());
        String usernameError = userValidation.validateUsername(username);
        if (usernameError != null) {
            throw new IllegalArgumentException(usernameError);
        }

        String email = trimToNull(profile.getEmail());
        String emailError = userValidation.validateEmail(email);
        if (emailError != null) {
            throw new IllegalArgumentException(emailError);
        }

        boolean hasOAuthProvider = currentUser.getAuthProviders().stream()
                .anyMatch(AuthProvider::isOAuth2Provider);
        boolean emailChanged = !Objects.equals(email, currentUser.getEmail());
        if (emailChanged && hasOAuthProvider) {
            throw new IllegalArgumentException("Email cannot be changed for OAuth2 accounts");
        }

        boolean usernameChanged = !Objects.equals(username, currentUser.getUsername());
        if (usernameChanged) {
            userRepository.findByUsername(username)
                    .filter(existing -> !existing.getId().equals(currentUser.getId()))
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException("User already registered!");
                    });
        }

        if (emailChanged) {
            userRepository.findByEmail(email)
                    .filter(existing -> !existing.getId().equals(currentUser.getId()))
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException("Email already registered!");
                    });
        }

        currentUser.setUsername(username);
        currentUser.setEmail(email);

        FullName fullName = currentUser.getName();
        if (fullName == null) {
            fullName = new FullName();
        }
        fullName.setName(trimToEmpty(profile.getName()));
        fullName.setSurname1(trimToEmpty(profile.getSurname1()));
        fullName.setSurname2(trimToEmpty(profile.getSurname2()));
        currentUser.setName(fullName);

        User savedUser = userRepository.save(currentUser);
        logger.info("Profile updated for user {}", savedUser.getUsername());

        return sessionService.reissueAccessTokenForCurrentSession(savedUser, request, response);
    }

    @Transactional
    public void changePassword(User currentUser, ChangePasswordDTO changePassword,
            HttpServletRequest request, HttpServletResponse response) {
        boolean hasLocalPassword = currentUser.getAuthProviders().contains(AuthProvider.LOCAL)
                && currentUser.getPassword() != null
                && !currentUser.getPassword().isBlank();

        if (!hasLocalPassword) {
            throw new IllegalArgumentException("Password change is not available for this account");
        }

        if (changePassword.getCurrentPassword() == null
                || !passwordEncoder.matches(changePassword.getCurrentPassword(), currentUser.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        String passwordError = userValidation.validatePassword(changePassword.getNewPassword());
        if (passwordError != null) {
            throw new IllegalArgumentException(passwordError);
        }

        if (passwordEncoder.matches(changePassword.getNewPassword(), currentUser.getPassword())) {
            throw new IllegalArgumentException("New password must be different from the current password");
        }

        currentUser.setPassword(passwordEncoder.encode(changePassword.getNewPassword()));
        User savedUser = userRepository.save(currentUser);

        List<AuthSession> activeSessions = authSessionRepository.findByUserAndRevokedAtIsNull(savedUser);
        for (AuthSession session : activeSessions) {
            sessionService.revokeSession(session, "PASSWORD_CHANGED");
        }

        sessionCookieService.clearAuthenticationCookies(response);
        csrfService.rotateToken(request, response);

        logger.info("Password changed for user {} and {} session(s) revoked", savedUser.getUsername(),
                activeSessions.size());
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}

package com.taskmanager.application.service;

import com.taskmanager.application.model.dto.LoginDTO;
import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.dto.SessionInfoDTO;
import com.taskmanager.application.model.entities.AuthProvider;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.validations.UserValidation;
import com.taskmanager.application.respository.UserRepository;

import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleService roleService;

    @Autowired
    private UserValidation userValidation;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public User login(LoginDTO login) {
        logger.info("Attempting login for username: {}", login.getUsername());

        Optional<User> user = userRepository.findByUsername(login.getUsername());
        if (user.isEmpty() || !verifyPassword(login.getPassword(), user.get().getPassword())) {
            logger.warn("Login failed: Authentication failed for user - {}", login.getUsername());
            throw new BadCredentialsException("Username or password is incorrect!");
        }

        if (user.get().isBlocked()) {
            logger.warn("Login failed: User is blocked - {}", login.getUsername());
            throw new LockedException("Your account has been blocked. Contact an administrator.");
        }

        logger.info("Login successful for user: {}", login.getUsername());
        return user.get();
    }

    private boolean verifyPassword(String enteredPassword, String storedPassword) {
        return passwordEncoder.matches(enteredPassword, storedPassword);
    }

    @Transactional
    public ResponseDTO register(User user) throws Exception { //TO-DO: Change ResponseDTO to difference between error and success
        logger.info("Attempting to register user: {}", user.getUsername());

        try {
            user.setCreationDate(new Date());
            ResponseDTO response;
            response = userValidation.validateUser(user);
            if (response.getErrorCount() > 0) {
                logger.warn("User validation failed for user: {} - Errors: {}", user.getUsername(), response.getErrorCount());
                return response;
            }
            Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
            if (existingUser.isPresent()) {
                logger.warn("Registration failed: Username already exists - {}", user.getUsername());
                response.addErrorMessage("User already registered!");
                return response;
            }

            Optional<User> existingEmail = userRepository.findByEmail(user.getEmail());
            if (existingEmail.isPresent()) {
                logger.warn("Registration failed: Email already exists - {}", user.getEmail());
                response.addErrorMessage("Email already registered!");
                return response;
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            if (roleService.existsBasicRole()) {
                user.addRole(roleService.getBasicRole());
            }
            user.addAuthProvider(AuthProvider.LOCAL);
            userRepository.save(user);
            logger.info("User registered successfully: {}", user.getUsername());
            response.addSuccessMessage("User registered successfully!"); //TO-DO: Change this message
            return response;

        } catch (Exception e) {
            logger.error("Error during registration for user: {} - Error: {}", user.getUsername(), e.getMessage(), e);
            throw new Exception(e.toString());
        }

    }

    public static String getCurrentUsername() {
        logger.debug("Getting current authenticated username");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.debug("No authenticated user found");
            return null; // No authenticated user
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            logger.debug("Current authenticated username: {}", username);
            return username;
        } else if (principal != null) {
            String principalStr = principal.toString();
            logger.debug("Current authenticated principal: {}", principalStr);
            return principalStr; // This occurs when not using UserDetails
        } else {
            logger.debug("Principal is null");
            return null;
        }
    }

    public User getCurrentUser() {
        logger.debug("Getting current authenticated user");
        String username = getCurrentUsername();
        if (username == null) {
            logger.debug("No current user found");
            return null;
        }

        try {
            User user = userRepository.findByUsername(username).orElseThrow(() -> null);
            logger.debug("Current user retrieved: {}", username);
            return user;
        } catch (Exception e) {
            logger.error("Error retrieving current user: {} - Error: {}", username, e.getMessage(), e);
            return null;
        }
    }

    // Get the roles of the authenticated user
    public Collection<? extends GrantedAuthority> getCurrentUserRoles() {
        logger.debug("Getting current user roles");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.debug("No authenticated user found for roles");
            return Collections.emptyList(); // No roles available
        }

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        logger.debug("Current user has {} roles", authorities.size());
        return authorities;
    }

    public boolean hasRole(String role) {
        logger.debug("Checking if current user has role: {}", role);
        Collection<? extends GrantedAuthority> authorities = getCurrentUserRoles();
        if (authorities == null) {
            logger.debug("No authorities found for role check");
            return false;
        }
        for (GrantedAuthority authority : authorities) {
            if (authority.getAuthority().equals(role)) {
                logger.debug("User has role: {}", role);
                return true;
            }
        }
        logger.debug("User does not have role: {}", role);
        return false;
    }

    public SessionInfoDTO buildSessionInfo(User user, Date expirationTime) {
        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new SessionInfoDTO(
                user.getUsername(),
                user.getEmail(),
                roles,
                expirationTime.getTime()
        );
    }
}

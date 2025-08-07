package com.taskmanager.application.service;

import com.taskmanager.application.model.dto.LoginDTO;
import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.entities.AuthProvider;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.validations.UserValidation;
import com.taskmanager.application.respository.UserRepository;
import com.taskmanager.application.security.OAuth2LoginFailureHandler;

import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private JWTUtilityService jwtUtilityService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleService roleService;

    @Autowired
    private UserValidation userValidation;

    @Transactional(readOnly = true)
    public HashMap<String, String> login(LoginDTO login) throws Exception {
        logger.info("Attempting login for username: {}", login.getUsername());
        
        try {
            HashMap<String, String> response = new HashMap<>();
            Optional<User> user = userRepository.findByUsername(login.getUsername());
            if (user.isEmpty()) {
                logger.warn("Login failed: User not registered - {}", login.getUsername());
                response.put("error", "User not registered!");
                return response;
            }

            if (verifyPassword(login.getPassword(), user.get().getPassword())) {
                logger.info("Login successful for user: {}", login.getUsername());
                String token = jwtUtilityService.generateJWT(user.get());
                response.put("token", token);
                return response;
            } else {
                logger.warn("Login failed: Authentication failed for user - {}", login.getUsername());
                response.put("error", "Authentication failed!");
                return response;
            }
        } catch (Exception e) {
            logger.error("Error during login for user: {} - Error: {}", login.getUsername(), e.getMessage(), e);
            throw new Exception(e.toString());
        }
    }

    private boolean verifyPassword(String enteredPassword, String storedPassword) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.matches(enteredPassword, storedPassword);
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

            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
            user.setPassword(encoder.encode(user.getPassword()));
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
            return null; // No hay usuario autenticado
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            logger.debug("Current authenticated username: {}", username);
            return username;
        } else {
            String username = principal.toString();
            logger.debug("Current authenticated principal: {}", username);
            return username; // Esto ocurre si no estás usando UserDetails
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

    // Obtener los roles del usuario autenticado
    public Collection<? extends GrantedAuthority> getCurrentUserRoles() {
        logger.debug("Getting current user roles");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.debug("No authenticated user found for roles");
            return Collections.emptyList(); // No hay roles disponibles
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
}

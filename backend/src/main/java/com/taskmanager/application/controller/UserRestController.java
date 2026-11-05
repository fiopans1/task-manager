package com.taskmanager.application.controller;

import com.taskmanager.application.model.dto.ChangePasswordDTO;
import com.taskmanager.application.model.dto.ProfileDTO;
import com.taskmanager.application.model.dto.SessionDTO;
import com.taskmanager.application.model.dto.UpdateProfileDTO;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.service.AuthService;
import com.taskmanager.application.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/user")
public class UserRestController {

    private static final Logger logger = LoggerFactory.getLogger(UserRestController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    public UserRestController() {
        logger.info("User REST controller initialized");
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileDTO> getProfile() {
        return ResponseEntity.ok(userService.getProfile(requireCurrentUser()));
    }

    @PutMapping("/profile")
    public ResponseEntity<SessionDTO> updateProfile(@RequestBody UpdateProfileDTO profile,
            HttpServletRequest request, HttpServletResponse response) {
        User currentUser = requireCurrentUser();
        logger.info("Updating profile for user {}", currentUser.getUsername());
        return ResponseEntity.ok(userService.updateProfile(currentUser, profile, request, response));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordDTO changePassword,
            HttpServletRequest request, HttpServletResponse response) {
        User currentUser = requireCurrentUser();
        logger.info("Password change requested for user {}", currentUser.getUsername());
        userService.changePassword(currentUser, changePassword, request, response);
        return ResponseEntity.noContent().build();
    }

    private User requireCurrentUser() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return currentUser;
    }
}

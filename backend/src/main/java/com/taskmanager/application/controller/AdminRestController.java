package com.taskmanager.application.controller;

import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.service.AdminService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Secured("ROLE_ADMIN")
public class AdminRestController {

    private static final Logger logger = LoggerFactory.getLogger(AdminRestController.class);

    @Autowired
    private AdminService adminService;

    // ===== USER MANAGEMENT =====

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> searchUsers(@RequestParam(required = false) String query) {
        logger.info("Admin searching users, query: {}", query);
        return ResponseEntity.ok(adminService.searchUsers(query));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long userId) throws ResourceNotFoundException {
        return ResponseEntity.ok(adminService.getUserById(userId));
    }

    @PostMapping("/users/{userId}/toggle-block")
    public ResponseEntity<Map<String, Object>> toggleUserBlock(@PathVariable Long userId) throws ResourceNotFoundException {
        return ResponseEntity.ok(adminService.toggleUserBlock(userId));
    }

    // ===== FEATURE FLAGS =====

    @GetMapping("/features")
    public ResponseEntity<Map<String, Boolean>> getFeatureFlags() {
        return ResponseEntity.ok(adminService.getAllFeatureFlags());
    }

    @PutMapping("/features/{featureName}")
    public ResponseEntity<Map<String, Boolean>> updateFeatureFlag(@PathVariable String featureName,
                                                                    @RequestBody Map<String, Boolean> body) {
        boolean enabled = body.getOrDefault("enabled", false);
        return ResponseEntity.ok(adminService.updateFeatureFlag(featureName, enabled));
    }

    // ===== SYSTEM MESSAGE =====

    @GetMapping("/system-message")
    public ResponseEntity<Map<String, Object>> getSystemMessage() {
        return ResponseEntity.ok(adminService.getSystemMessage());
    }

    @PutMapping("/system-message")
    public ResponseEntity<Map<String, Object>> updateSystemMessage(@RequestBody Map<String, Object> body) {
        String message = (String) body.getOrDefault("message", "");
        boolean enabled = Boolean.TRUE.equals(body.get("enabled"));
        boolean showBeforeLogin = Boolean.TRUE.equals(body.get("showBeforeLogin"));
        boolean showAfterLogin = body.get("showAfterLogin") == null || Boolean.TRUE.equals(body.get("showAfterLogin"));
        return ResponseEntity.ok(adminService.updateSystemMessage(message, enabled, showBeforeLogin, showAfterLogin));
    }
}

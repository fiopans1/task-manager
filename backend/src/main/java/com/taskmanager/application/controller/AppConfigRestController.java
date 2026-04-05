package com.taskmanager.application.controller;

import com.taskmanager.application.service.AdminService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class AppConfigRestController {

    private static final Logger logger = LoggerFactory.getLogger(AppConfigRestController.class);

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPublicConfig() {
        logger.debug("Retrieving public application config");
        return ResponseEntity.ok(adminService.getPublicConfig());
    }
}

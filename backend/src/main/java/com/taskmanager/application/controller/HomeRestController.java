package com.taskmanager.application.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.application.model.dto.HomeSummaryDTO;
import com.taskmanager.application.service.HomeService;

@RestController
@RequestMapping("/api/home-summary")
public class HomeRestController {

    private static final Logger logger = LoggerFactory.getLogger(HomeRestController.class);

    @Autowired
    private HomeService homeService;

    @GetMapping
    public ResponseEntity<HomeSummaryDTO> getHomeSummary() {
        logger.info("Retrieving home summary for logged user");

        try {
            HomeSummaryDTO summary = homeService.getHomeSummary();
            logger.info("Home summary retrieved successfully");
            return ResponseEntity.ok().body(summary);
        } catch (Exception e) {
            logger.error("Error retrieving home summary", e);
            throw e;
        }
    }
}
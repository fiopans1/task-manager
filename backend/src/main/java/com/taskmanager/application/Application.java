package com.taskmanager.application;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

    private static final Logger logger = LoggerFactory.getLogger(Application.class);

    public static void main(String[] args) {
        logger.info("Starting Task Manager Application...");
        try {
            SpringApplication.run(Application.class, args);
            logger.info("Task Manager Application started successfully");
        } catch (Exception e) {
            logger.error("Failed to start Task Manager Application", e);
            throw e;
        }
    }

}

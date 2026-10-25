package com.taskmanager.application.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.taskmanager.application.model.validations.UserValidation;

@Configuration
public class BeanConfiguration {


    @Bean
    public UserValidation userValidation() {
        return new UserValidation();
    }

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}

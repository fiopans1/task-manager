package com.taskmanager.application.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.taskmanager.application.model.validations.UserValidation;

@Configuration
public class BeanConfiguration {


    @Bean
    public UserValidation userValidation() {
        return new UserValidation();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}

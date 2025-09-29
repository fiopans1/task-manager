package com.taskmanager.application.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de seguridad para tests Esta clase desactiva los filtros de
 * seguridad JWT para las pruebas unitarias y permite usar anotaciones
 * @WithMockUser
 */
@TestConfiguration
public class SecurityTestConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Desactivamos la seguridad para pruebas
        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                .anyRequest().permitAll());

        return http.build();
    }
}

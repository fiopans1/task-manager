package com.taskmanager.application.config;

import com.taskmanager.application.model.entities.Role;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.respository.RoleRepository;
import com.taskmanager.application.respository.UserRepository;
import java.util.Collections;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;


@Configuration
public class DataLoader {
    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Crea el rol ADMIN si no existe
            Role adminRole = roleRepository.findByName("ADMIN")
            .orElseGet(() -> {
                Role role = new Role();
                role.setName("ROLE_ADMIN");
                return roleRepository.save(role);
            });

            // Crea el usuario ADMIN si no existe
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin")); // Encripta la contraseña
                admin.setEmail("admin@example.com");
                admin.setRoles(Collections.singleton(adminRole)); // Asigna el rol ADMIN
                userRepository.save(admin);
            }
        };
    }
}


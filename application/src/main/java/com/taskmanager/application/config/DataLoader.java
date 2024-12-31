package com.taskmanager.application.config;

import com.taskmanager.application.model.entities.AuthorityOfRole;
import com.taskmanager.application.model.entities.RoleOfUser;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.respository.AuthorityRepository;
import com.taskmanager.application.respository.RoleRepository;
import com.taskmanager.application.respository.UserRepository;
import java.util.Collections;
import java.util.Set;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;



@Configuration
public class DataLoader {
    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, RoleRepository roleRepository, AuthorityRepository authorityRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Crea el rol ADMIN si no existe
            RoleOfUser adminRole = roleRepository.findByName("ADMIN")
            .orElseGet(() -> {
                RoleOfUser role = new RoleOfUser();
                role.setName("ADMIN");
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


            RoleOfUser basicRole = roleRepository.findByName("BASIC")
            .orElseGet(() -> {
                RoleOfUser role = new RoleOfUser();
                role.setName("BASIC");
                AuthorityOfRole authority = authorityRepository.findByName("READ_PRIVILEGES")
                .orElseGet(() -> {
                    AuthorityOfRole auth = new AuthorityOfRole();
                    auth.setName("READ_PRIVILEGES");
                    return authorityRepository.save(auth);
                });
                role.setAuthorities(Set.of(authority));
                return roleRepository.save(role);
            });

            // Crea el usuario ADMIN si no existe
            if (userRepository.findByUsername("basic").isEmpty()) {
                User user = new User();
                user.setUsername("basic");
                user.setPassword(passwordEncoder.encode("basic")); // Encripta la contraseña
                user.setEmail("basic@example.com");
                user.setRoles(Collections.singleton(basicRole)); // Asigna el rol ADMIN
                userRepository.save(user);
            }
        };
    }
}


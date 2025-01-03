package com.taskmanager.application.controller;

import com.taskmanager.application.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/prueba")
public class TestController {

    @Autowired
    private AuthService authService;
    // Ruta accesible solo con el rol ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public String adminOnly() {
        return "¡Hola ADMIN! Solo los administradores pueden acceder aquí.";
    }

    // Ruta accesible para cualquier usuario autenticado
    @PreAuthorize("hasAuthority('READ_PRIVILEGES')")
    @GetMapping("/public")
    public String publicAccess() {
        return "¡Hola! Cualquier usuario autenticado puede acceder aquí.";
    }
}
package com.taskmanager.application.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.stereotype.Service;

@Service
public class CsrfService {

    @Autowired
    private CsrfTokenRepository csrfTokenRepository;

    public CsrfToken ensureToken(HttpServletRequest request, HttpServletResponse response) {
        Object requestAttribute = request.getAttribute(CsrfToken.class.getName());
        if (requestAttribute instanceof CsrfToken csrfToken) {
            return csrfToken;
        }

        CsrfToken csrfToken = csrfTokenRepository.loadToken(request);
        if (csrfToken != null) {
            return csrfToken;
        }

        CsrfToken newToken = csrfTokenRepository.generateToken(request);
        csrfTokenRepository.saveToken(newToken, request, response);
        return newToken;
    }

    public CsrfToken rotateToken(HttpServletRequest request, HttpServletResponse response) {
        csrfTokenRepository.saveToken(null, request, response);
        CsrfToken newToken = csrfTokenRepository.generateToken(request);
        csrfTokenRepository.saveToken(newToken, request, response);
        return newToken;
    }
}

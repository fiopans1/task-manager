package com.taskmanager.application.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import com.taskmanager.application.service.CustomUserDetailsService;
import com.taskmanager.application.service.JWTUtilityService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.text.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;






public class JWTAuthorizationFilter extends OncePerRequestFilter {

    @Autowired
    private JWTUtilityService jwtUtilityService;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    public JWTAuthorizationFilter(JWTUtilityService jwtUtilityService, CustomUserDetailsService customUserDetailsService) {
        this.jwtUtilityService = jwtUtilityService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);

        try {
            JWTClaimsSet claims = jwtUtilityService.parseJWT(token);
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(claims.getSubject());
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException | IOException | JOSEException
                | ParseException e) {
            throw new RuntimeException(e);
        }
        filterChain.doFilter(request, response);


    }

}

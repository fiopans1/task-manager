package com.taskmanager.application.config;

import com.taskmanager.application.security.JWTAuthorizationFilter;
import com.taskmanager.application.security.OAuth2LoginFailureHandler;
import com.taskmanager.application.security.OAuth2LoginSuccessHandler;
import com.taskmanager.application.security.SpaCsrfTokenRequestHandler;
import com.taskmanager.application.service.CustomOidcUserService;
import com.taskmanager.application.service.CustomOAuth2UserService;

import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.InvalidCsrfTokenException;
import org.springframework.security.web.csrf.MissingCsrfTokenException;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true)
public class WebSecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(WebSecurityConfig.class);

    @Autowired
    private JWTAuthorizationFilter jwtAuthorizationFilter;

    @Autowired
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private CustomOidcUserService customOidcUserService;

    @Autowired
    private OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    @Autowired
    private TaskManagerSecurityProperties securityProperties;

    @Autowired
    private CookieCsrfTokenRepository cookieCsrfTokenRepository;

    @Value("${taskmanager.oauth2.enabled:true}")
    private boolean oAuth2IsEnabled;

    @Bean
    public AccessDeniedHandler csrfAccessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            if (accessDeniedException instanceof MissingCsrfTokenException
                    || accessDeniedException instanceof InvalidCsrfTokenException) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Invalid or missing CSRF token\"}");
                return;
            }

            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Access denied\"}");
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring security filter chain");

        http.authorizeHttpRequests(authorizeRequests
                -> authorizeRequests
                        .requestMatchers("/auth/**", "/oauth2/**", "/health", "/error", "/api/config", "/api/session/me", "/api/session/csrf", "/api/session/refresh", "/api/session/logout").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated()
        );

        http.sessionManagement(sessionManager
                -> sessionManager.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        http.csrf(csrf -> csrf
                .csrfTokenRepository(cookieCsrfTokenRepository)
                .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
        );

        if (oAuth2IsEnabled) {
            logger.info("OAuth2 is enabled, configuring OAuth2 login");
            http.oauth2Login(oauth2 -> oauth2
                    .redirectionEndpoint(endpoint -> endpoint.baseUri("/oauth2/callback/*"))
                    .userInfoEndpoint(userInfo -> userInfo
                            .userService(customOAuth2UserService)
                            .oidcUserService(customOidcUserService)
                    )
                    .successHandler(oAuth2LoginSuccessHandler)
                    .failureHandler(oAuth2LoginFailureHandler)
            );
        } else {
            logger.info("OAuth2 is disabled");
        }

        http.addFilterBefore(jwtAuthorizationFilter, UsernamePasswordAuthenticationFilter.class);

        http.exceptionHandling(exceptionHandling -> exceptionHandling
                .accessDeniedHandler(csrfAccessDeniedHandler())
                .authenticationEntryPoint((request, response, authException) -> {
                    logger.warn("Unauthorized access attempt from: {}", request.getRemoteAddr());
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                }));

        logger.info("Security filter chain configured successfully");
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(securityProperties.getCors().getAllowedOrigins());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Origin", "Content-Type", "Accept", securityProperties.getCsrf().getHeaderName()));
        configuration.setExposedHeaders(List.of(HttpHeaders.SET_COOKIE));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}

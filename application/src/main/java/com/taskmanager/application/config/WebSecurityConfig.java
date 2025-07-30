package com.taskmanager.application.config;

import com.taskmanager.application.security.JWTAuthorizationFilter;
import com.taskmanager.application.security.OAuth2LoginSuccessHandler;
import com.taskmanager.application.service.CustomOAuth2UserService;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true)
public class WebSecurityConfig {

    @Autowired
    private JWTAuthorizationFilter jwtAuthorizationFilter;

    @Autowired
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(authorizeRequests
                -> authorizeRequests.requestMatchers("/auth/**", "/oauth2/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() //TO-DO: Change thiis for a filter
                        .anyRequest().authenticated()
        );

        http.sessionManagement(sessionManager
                -> sessionManager.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );
        //sino desabilitamos el csrf no podremos usar la aplicacion como api
        http.csrf(csrf -> csrf.disable());
        http.httpBasic(Customizer.withDefaults()); // Habilita la autenticación básica

        http.oauth2Login(oauth2 -> oauth2
                // .authorizationEndpoint(endpoint -> endpoint.baseUri("/oauth2/authorize"))
                .redirectionEndpoint(endpoint -> endpoint.baseUri("/oauth2/callback/*"))
                .userInfoEndpoint(userInfo -> userInfo
                .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2LoginSuccessHandler)
        // .failureHandler(oAuth2LoginFailureHandler) // opcional
        );

        http.addFilterBefore(jwtAuthorizationFilter, UsernamePasswordAuthenticationFilter.class); //check sino necesitamos el constructor

        http.exceptionHandling(exceptionHandling -> exceptionHandling.authenticationEntryPoint((request, response, authException) -> {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
        })); //TO-DO: Change this for a filter

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}

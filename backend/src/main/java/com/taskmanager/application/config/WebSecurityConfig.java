package com.taskmanager.application.config;

import com.taskmanager.application.security.JWTAuthorizationFilter;
import com.taskmanager.application.security.OAuth2LoginFailureHandler;
import com.taskmanager.application.security.OAuth2LoginSuccessHandler;
import com.taskmanager.application.service.CustomOAuth2UserService;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

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
    private OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    @Value("${taskmanager.oauth2.enabled:true}")
    private boolean oAuth2IsEnabled;

    @Value("${taskmanager.auth.password-strength:12}")
    private int passwordStrength;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring security filter chain");

        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfTokenRepository.setCookiePath("/");

        http.authorizeHttpRequests(authorizeRequests
                -> authorizeRequests.requestMatchers("/auth/**", "/oauth2/**", "/health", "/api/config").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() //TO-DO: Change thiis for a filter
                        .anyRequest().authenticated()
        );

        http.cors(Customizer.withDefaults());

        http.sessionManagement(sessionManager
                -> sessionManager.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );
        http.csrf(csrf -> csrf
                .csrfTokenRepository(csrfTokenRepository)
                .ignoringRequestMatchers("/oauth2/**")
        );

        if (oAuth2IsEnabled) {
            logger.info("OAuth2 is enabled, configuring OAuth2 login");
            http.oauth2Login(oauth2 -> oauth2
                    .redirectionEndpoint(endpoint -> endpoint.baseUri("/oauth2/callback/*"))
                    .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                    )
                    .successHandler(oAuth2LoginSuccessHandler)
                    .failureHandler(oAuth2LoginFailureHandler)
            );
        } else {
            logger.info("OAuth2 is disabled");
        }

        http.addFilterBefore(jwtAuthorizationFilter, UsernamePasswordAuthenticationFilter.class); //check if we still need the constructor
        http.addFilterAfter(new CsrfCookieFilter(), CsrfFilter.class);

        http.exceptionHandling(exceptionHandling -> exceptionHandling.authenticationEntryPoint((request, response, authException) -> {
            logger.warn("Unauthorized access attempt from: {}", request.getRemoteAddr());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
        })); //TO-DO: Change this for a filter

        logger.info("Security filter chain configured successfully");
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(passwordStrength);
    }

    private static final class CsrfCookieFilter extends OncePerRequestFilter {

        @Override
        protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest request,
                                        HttpServletResponse response,
                                        jakarta.servlet.FilterChain filterChain)
                throws jakarta.servlet.ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                csrfToken.getToken();
            }
            filterChain.doFilter(request, response);
        }
    }

}

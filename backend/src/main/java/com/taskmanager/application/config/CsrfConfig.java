package com.taskmanager.application.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.util.StringUtils;

@Configuration
public class CsrfConfig {

    @Bean
    public CookieCsrfTokenRepository cookieCsrfTokenRepository(TaskManagerSecurityProperties securityProperties) {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookieName(securityProperties.getCsrf().getCookieName());
        repository.setHeaderName(securityProperties.getCsrf().getHeaderName());
        repository.setParameterName(securityProperties.getCsrf().getParameterName());
        repository.setCookieCustomizer((cookieBuilder) -> {
            cookieBuilder
                    .path(securityProperties.getCsrf().getPath())
                    .secure(securityProperties.getCookies().isSecure())
                    .sameSite(securityProperties.getCookies().getSameSite());

            if (StringUtils.hasText(securityProperties.getCookies().getDomain())) {
                cookieBuilder.domain(securityProperties.getCookies().getDomain());
            }
        });
        return repository;
    }
}

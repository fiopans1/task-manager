package com.taskmanager.application.model.entities;

import org.springframework.context.ApplicationContext;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.taskmanager.application.context.ApplicationContextProvider;
import com.taskmanager.application.service.oauth2providers.GithubOAuth2ProviderServiceImpl;
import com.taskmanager.application.service.oauth2providers.GoogleOAuth2ProviderServiceImpl;
import com.taskmanager.application.service.oauth2providers.OAuth2ProviderService;

public enum AuthProvider {

    GITHUB("github", GithubOAuth2ProviderServiceImpl.class),
    GOOGLE("google", GoogleOAuth2ProviderServiceImpl.class),
    LOCAL("local", null); // Para usuarios registrados localmente

    private final String value;

    private final Class<? extends OAuth2ProviderService> serviceClass;
    private static ApplicationContext applicationContext;

    AuthProvider(String value, Class<? extends OAuth2ProviderService> serviceClass) {
        this.value = value;
        this.serviceClass = serviceClass;
    }

    public String getValue() {
        return value;
    }

    public static void setApplicationContext(ApplicationContext context) {
        applicationContext = context;
    }

    /**
     * Obtiene el servicio específico para este proveedor
     */
    private OAuth2ProviderService getService() {
        if (serviceClass == null) {
            throw new UnsupportedOperationException("No service available for LOCAL provider");
        }
        if (applicationContext == null) {
            throw new IllegalStateException("ApplicationContext no ha sido configurado");
        }
        return applicationContext.getBean(serviceClass);
    }

    /**
     * Métodos predefinidos que delegan en el servicio específico
     */
    public String extractEmail(OAuth2User oauthUser, OAuth2UserRequest userRequest) {
        return getService().extractEmail(oauthUser, userRequest);
    }

    public FullName extractFullName(OAuth2User oauthUser) {
        return getService().extractFullName(oauthUser);
    }

    public String extractUsername(OAuth2User oauthUser) {
        return getService().extractUsername(oauthUser);
    }

    // public String extractProfilePicture(OAuth2User oauthUser) {
    //     return getService().extractProfilePicture(oauthUser);
    // }
    public String extractProviderId(OAuth2User oauthUser) {
        return getService().extractProviderId(oauthUser);
    }

    /**
     * Método estático para crear desde string
     */
    public static AuthProvider fromString(String value) {
        for (AuthProvider provider : values()) {
            if (provider.value.equalsIgnoreCase(value)) {
                return provider;
            }
        }
        throw new IllegalArgumentException("Unknown auth provider: " + value);
    }

    /**
     * Verifica si este proveedor soporta OAuth2
     */
    public boolean isOAuth2Provider() {
        return serviceClass != null;
    }
}

package com.taskmanager.application.service.oauth2providers;

import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.taskmanager.application.model.entities.FullName;

public interface OAuth2ProviderService {

    /**
     * Extrae el email del usuario OAuth2
     */
    String extractEmail(OAuth2User user, OAuth2UserRequest userRequest);

    /**
     * Extrae el nombre completo del usuario
     */
    FullName extractFullName(OAuth2User user);

    /**
     * Extrae el username preferido
     */
    String extractUsername(OAuth2User user);

    // /**
    //  * Extrae la URL de la imagen de perfil
    //  */
    // String extractProfilePicture(OAuth2User user);

    /**
     * Obtiene el identificador único del proveedor
     */
    String extractProviderId(OAuth2User user);
}

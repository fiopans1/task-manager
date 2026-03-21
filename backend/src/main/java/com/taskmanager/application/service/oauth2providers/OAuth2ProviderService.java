package com.taskmanager.application.service.oauth2providers;

import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.taskmanager.application.model.entities.FullName;

public interface OAuth2ProviderService {

    /**
     * Extracts the OAuth2 user's email
     */
    String extractEmail(OAuth2User user, OAuth2UserRequest userRequest);

    /**
     * Extracts the user's full name
     */
    FullName extractFullName(OAuth2User user);

    /**
     * Extracts the preferred username
     */
    String extractUsername(OAuth2User user);

    // /**
    //  * Extracts the profile picture URL
    //  */
    // String extractProfilePicture(OAuth2User user);
    /**
     * Gets the provider's unique identifier
     */
    String extractProviderId(OAuth2User user);

    /**
     * Extracts whether the provider is active or not
     */
    boolean isProviderActive();
}

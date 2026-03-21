package com.taskmanager.application.service.oauth2providers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.taskmanager.application.model.entities.FullName;

@Service
public class GoogleOAuth2ProviderServiceImpl implements OAuth2ProviderService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleOAuth2ProviderServiceImpl.class);

    @Value("${taskmanager.oauth2.google.enabled:false}")
    private boolean isProviderActive;

    @Override
    public String extractEmail(OAuth2User user, OAuth2UserRequest userRequest) {
        logger.debug("Extracting email from Google OAuth2 user");

        if (user instanceof OidcUser oidcUser) {
            String email = oidcUser.getEmail();
            logger.debug("Successfully extracted email from Google OIDC user");
            return email;
        }

        String email = user.getAttribute("email");
        logger.debug("Successfully extracted email from Google OAuth2 user");
        return email;
    }

    @Override
    public FullName extractFullName(OAuth2User user) {
        logger.debug("Extracting full name from Google OAuth2 user");

        if (user instanceof OidcUser oidcUser) {
            String givenName = oidcUser.getGivenName();
            String familyName = oidcUser.getFamilyName();
            String fullName = oidcUser.getFullName();

            if (givenName != null || familyName != null) {
                logger.debug("Using given name and family name from Google OIDC user");
                // Split family name into apellido1 and apellido2 if it contains multiple parts
                String apellido1 = "";
                String apellido2 = "";
                if (familyName != null) {
                    String[] familyParts = familyName.split("\\s+", 2);
                    apellido1 = familyParts.length > 0 ? familyParts[0] : "";
                    apellido2 = familyParts.length > 1 ? familyParts[1] : "";
                }

                return new FullName(
                        givenName != null ? givenName : "",
                        apellido1,
                        apellido2
                );
            } else if (fullName != null) {
                logger.debug("Using full name from Google OIDC user");
                String[] parts = fullName.split("\\s+");
                String nombre = parts.length > 0 ? parts[0] : "";
                String apellido1 = parts.length > 1 ? parts[1] : "";
                String apellido2 = parts.length > 2 ? parts[2] : "";
                return new FullName(nombre, apellido1, apellido2);
            }
        }

        String name = user.getAttribute("name");
        if (name != null) {
            logger.debug("Using name attribute from Google OAuth2 user");
            String[] parts = name.split("\\s+");
            String nombre = parts.length > 0 ? parts[0] : "";
            String apellido1 = parts.length > 1 ? parts[1] : "";
            String apellido2 = parts.length > 2 ? parts[2] : "";
            return new FullName(nombre, apellido1, apellido2);
        }

        logger.debug("No full name available from Google user, returning empty");
        return FullName.empty();
    }

    @Override
    public String extractUsername(OAuth2User user) {
        logger.debug("Extracting username from Google OAuth2 user");

        String username;
        if (user instanceof OidcUser oidcUser) {
            username = oidcUser.getPreferredUsername();
            logger.debug("Using preferred username from Google OIDC user");
        } else {
            username = user.getAttribute("preferred_username");
            logger.debug("Using preferred_username attribute from Google OAuth2 user");
        }

        if (username == null || username.isEmpty()) {
            String email = user.getAttribute("email");
            String extractedUsername = email != null ? email.split("@")[0] : null;
            logger.debug("No preferred username available, generated from email: {}", extractedUsername);
            return extractedUsername;
        } else {
            logger.debug("Successfully extracted username from Google user: {}", username);
            return username;
        }
    }

    // @Override
    // public String extractProfilePicture(OAuth2User user) {
    //     if (user instanceof OidcUser) {
    //         OidcUser oidcUser = (OidcUser) user;
    //         return oidcUser.getPicture();
    //     }
    //     return user.getAttribute("picture");
    // }
    @Override
    public String extractProviderId(OAuth2User user) {
        logger.debug("Extracting provider ID from Google OAuth2 user");

        if (user instanceof OidcUser oidcUser) {
            String providerId = oidcUser.getSubject();
            logger.debug("Successfully extracted provider ID from Google OIDC user");
            return providerId;
        }

        String providerId = user.getAttribute("sub");
        logger.debug("Successfully extracted provider ID from Google OAuth2 user");
        return providerId;
    }

    @Override
    public boolean isProviderActive() {
        logger.debug("Checking if Google OAuth2 provider is active: {}", isProviderActive);
        return isProviderActive;
    }
}

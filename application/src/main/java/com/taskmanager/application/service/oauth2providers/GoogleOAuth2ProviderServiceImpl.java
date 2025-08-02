package com.taskmanager.application.service.oauth2providers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.taskmanager.application.model.entities.FullName;

@Service
public class GoogleOAuth2ProviderServiceImpl implements OAuth2ProviderService {

    @Value("${taskmanager.oauth2.google.enabled:false}")
    private boolean isProviderActive;

    @Override
    public String extractEmail(OAuth2User user, OAuth2UserRequest userRequest) {
        if (user instanceof OidcUser) {
            OidcUser oidcUser = (OidcUser) user;
            return oidcUser.getEmail();
        }
        return user.getAttribute("email");
    }

    @Override
    public FullName extractFullName(OAuth2User user) {
        if (user instanceof OidcUser) {
            OidcUser oidcUser = (OidcUser) user;
            String givenName = oidcUser.getGivenName();
            String familyName = oidcUser.getFamilyName();
            String fullName = oidcUser.getFullName();

            if (givenName != null || familyName != null) {
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
            String[] parts = fullName.split("\\s+");
            String nombre = parts.length > 0 ? parts[0] : "";
            String apellido1 = parts.length > 1 ? parts[1] : "";
            String apellido2 = parts.length > 2 ? parts[2] : "";
            return new FullName(nombre, apellido1, apellido2);
            }
        }

        String name = user.getAttribute("name");
        if (name != null) {
            String[] parts = name.split("\\s+");
            String nombre = parts.length > 0 ? parts[0] : "";
            String apellido1 = parts.length > 1 ? parts[1] : "";
            String apellido2 = parts.length > 2 ? parts[2] : "";
            return new FullName(nombre, apellido1, apellido2);
        }

        return FullName.empty();
    }

    @Override
    public String extractUsername(OAuth2User user) {
        String username;
        if (user instanceof OidcUser) {
            OidcUser oidcUser = (OidcUser) user;
            username = oidcUser.getPreferredUsername();
        } else {
            username = user.getAttribute("preferred_username");
        }

        if (username == null || username.isEmpty()) {
            String email = user.getAttribute("email");
            return email != null ? email.split("@")[0] : null;
        }else{
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
        if (user instanceof OidcUser) {
            OidcUser oidcUser = (OidcUser) user;
            return oidcUser.getSubject();
        }
        return user.getAttribute("sub");
    }

    @Override
    public boolean isProviderActive() {
        return isProviderActive;
    }
}

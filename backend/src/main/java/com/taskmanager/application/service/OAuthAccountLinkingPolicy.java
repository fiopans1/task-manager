package com.taskmanager.application.service;

import com.taskmanager.application.model.entities.AuthProvider;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.OAuth2AuthenticationProcessingException;

/**
 * Email-only account linking is unsafe while local registration does not verify
 * email ownership: an attacker can pre-register a victim's address and retain
 * the local password. Until an explicit, authenticated linking flow exists,
 * only accounts already linked to the provider may complete an OAuth2 login.
 */
public final class OAuthAccountLinkingPolicy {

    private OAuthAccountLinkingPolicy() {
    }

    public static void ensureProviderCanBeLinked(User existingUser, AuthProvider provider) {
        if (!existingUser.getAuthProviders().contains(provider)) {
            throw new OAuth2AuthenticationProcessingException(
                    "This email is already registered. Sign in with an existing method before linking "
                    + provider.getValue() + ".");
        }
    }
}

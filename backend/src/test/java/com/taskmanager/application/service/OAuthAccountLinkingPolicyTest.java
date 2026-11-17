package com.taskmanager.application.service;

import com.taskmanager.application.model.entities.AuthProvider;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.OAuth2AuthenticationProcessingException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Regression tests for the email-linking policy. These use real User objects
 * and the production policy; no mocks are involved.
 */
class OAuthAccountLinkingPolicyTest {

    @Test
    void localAccountCannotBeSilentlyLinkedToOAuth() {
        User local = new User();
        local.addAuthProvider(AuthProvider.LOCAL);

        assertThrows(OAuth2AuthenticationProcessingException.class,
                () -> OAuthAccountLinkingPolicy.ensureProviderCanBeLinked(local, AuthProvider.GOOGLE));
    }

    @Test
    void alreadyLinkedProviderCanLogIn() {
        User google = new User();
        google.addAuthProvider(AuthProvider.GOOGLE);

        assertDoesNotThrow(
                () -> OAuthAccountLinkingPolicy.ensureProviderCanBeLinked(google, AuthProvider.GOOGLE));
    }

    @Test
    void oauthAccountCannotBeSilentlyLinkedToASecondProvider() {
        User google = new User();
        google.addAuthProvider(AuthProvider.GOOGLE);

        assertThrows(OAuth2AuthenticationProcessingException.class,
                () -> OAuthAccountLinkingPolicy.ensureProviderCanBeLinked(google, AuthProvider.GITHUB));
    }
}

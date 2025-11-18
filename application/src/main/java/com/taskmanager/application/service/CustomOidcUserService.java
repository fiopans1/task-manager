package com.taskmanager.application.service;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import com.taskmanager.application.model.entities.AuthProvider;
import com.taskmanager.application.model.entities.FullName;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.OAuth2AuthenticationProcessingException;
import com.taskmanager.application.respository.UserRepository;
import com.taskmanager.application.security.UserPrincipal;

@Service
public class CustomOidcUserService extends OidcUserService {

    private static final Logger logger = LoggerFactory.getLogger(CustomOidcUserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleService roleService;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        logger.info("Loading OIDC user from provider: {}", userRequest.getClientRegistration().getRegistrationId());

        // 1. Load OIDC provider information
        OidcUser oidcUser = super.loadUser(userRequest);

        try {
            // 2. Process and save/update user in DB
            OidcUser processedUser = processOidcUser(userRequest, oidcUser);
            logger.info("OIDC user processed successfully: {}", oidcUser.getEmail());
            return processedUser;
        } catch (AuthenticationException ex) {
            logger.error("Authentication error during OIDC user processing: {}", ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            logger.error("Unexpected error during OIDC user processing", ex);
            // Wrapping internal exceptions as OAuth2AuthenticationException
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    /**
     * Processes OIDC user information and saves/updates it in the DB
     */
    private OidcUser processOidcUser(OidcUserRequest userRequest, OidcUser oidcUser) {
        String provider = userRequest.getClientRegistration().getRegistrationId();
        logger.debug("Processing OIDC user from provider: {}", provider);

        AuthProvider authProvider = AuthProvider.fromString(provider);

        // Validate provider
        if (authProvider == null || !authProvider.isOAuth2Provider()) {
            logger.error("OIDC provider not supported: {}", provider);
            throw new OAuth2AuthenticationProcessingException("Provider OIDC not supported: " + provider);
        }
        if (!authProvider.isProviderActive()) {
            logger.error("OIDC provider inactive: {}", provider);
            throw new OAuth2AuthenticationProcessingException("Provider OIDC inactive: " + provider);
        }

        logger.debug("OIDC provider validated: {}", provider);

        // Find or create user
        User user = findOrCreateUser(oidcUser, authProvider, userRequest);
        logger.info("OIDC user processed for provider {}: {}", provider, user.getEmail());

        // Create and return UserPrincipal with OIDC user data
        // Note: OIDC attributes include both standard claims and additional attributes
        return UserPrincipal.createOidc(user, oidcUser.getAttributes(), oidcUser.getIdToken(), oidcUser.getUserInfo());
    }

    /**
     * Finds or creates a user based on OIDC information
     */
    private User findOrCreateUser(OidcUser oidcUser, AuthProvider provider, OidcUserRequest userRequest) {
        String email = provider.extractEmail(oidcUser, userRequest);
        logger.debug("Extracting email from OIDC user: {}", email);

        if (email == null || email.isEmpty()) {
            logger.error("Email not found in OIDC user from provider: {}", provider);
            throw new OAuth2AuthenticationProcessingException("Email not found in OIDC user");
        }

        return userRepository.findByEmail(email)
                .map(existingUser -> {
                    logger.info("Updating existing user from OIDC: {}", email);
                    return updateExistingUser(existingUser, oidcUser, provider);
                })
                .orElseGet(() -> {
                    logger.info("Creating new user from OIDC: {}", email);
                    return createNewUser(oidcUser, provider, email);
                });
    }

    /**
     * Updates an existing user with OIDC information
     */
    private User updateExistingUser(User existingUser, OidcUser oidcUser, AuthProvider provider) {
        logger.debug("Updating existing user: {} with provider: {}", existingUser.getEmail(), provider);

        // Add the new provider if not already present
        if (!existingUser.getAuthProviders().contains(provider)) {
            logger.debug("Adding new auth provider {} to user: {}", provider, existingUser.getEmail());
            existingUser.addAuthProvider(provider);
        }

        // Actualizar información del usuario si es necesario
        FullName fullName = provider.extractFullName(oidcUser);
        if (fullName != null && !fullName.getFullName().isEmpty() && existingUser.getName() == null) {
            logger.debug("Updating user full name: {}", fullName.getFullName());
            existingUser.setName(fullName);
        }

        String username = provider.extractUsername(oidcUser);
        if (existingUser.getUsername() == null || existingUser.getUsername().isEmpty()) {
            if (username == null || username.isEmpty()) {
                username = generateUniqueUsername(existingUser.getEmail());
            }
            logger.debug("Setting username for user: {}", username);
            existingUser.setUsername(username);
        }

        // Actualizar timestamp de último login
        // existingUser.setLastLoginDate(new Date());
        User savedUser = userRepository.save(existingUser);
        logger.info("Successfully updated existing user: {}", savedUser.getEmail());
        return savedUser;
    }

    /**
     * Creates a new user based on OIDC information
     */
    private User createNewUser(OidcUser oidcUser, AuthProvider provider, String email) {
        logger.debug("Creating new user with email: {} and provider: {}", email, provider);

        User newUser = new User();
        newUser.setEmail(email);
        newUser.addAuthProvider(provider);

        String username = provider.extractUsername(oidcUser);
        if (username == null || username.isEmpty() || userRepository.existsByUsername(username)) {
            username = generateUniqueUsername(email);
            logger.debug("Generated unique username: {} for email: {}", username, email);
        }
        newUser.setUsername(username);

        FullName fullName = provider.extractFullName(oidcUser);
        if (fullName == null) {
            fullName = new FullName(username, "", "");
            logger.debug("Using username as full name for new user: {}", username);
        }
        newUser.setName(fullName);

        // Set profile picture using OIDC specific method
        // String picture = provider.extractProfilePicture(oidcUser);
        // if (picture != null && !picture.isEmpty()) {
        //     newUser.setProfilePicture(picture);
        // }
        // Assign basic role if exists
        if (roleService.existsBasicRole()) {
            newUser.addRole(roleService.getBasicRole());
            logger.debug("Assigned basic role to new user: {}", email);
        }

        // Set timestamps
        newUser.setCreationDate(new Date());

        User savedUser = userRepository.save(newUser);
        logger.info("Successfully created new user: {} with provider: {}", savedUser.getEmail(), provider);
        return savedUser;
    }

    /**
     * Generates a unique username based on email
     */
    private String generateUniqueUsername(String email) {
        String baseUsername = email.substring(0, email.indexOf('@'));
        String username = baseUsername;
        int counter = 1;

        logger.debug("Generating unique username for email: {}", email);

        // Check if username already exists and generate a unique one
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        logger.debug("Generated unique username: {}", username);
        return username;
    }
}

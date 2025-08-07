package com.taskmanager.application.service;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.taskmanager.application.model.entities.AuthProvider;
import com.taskmanager.application.model.entities.FullName;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.OAuth2AuthenticationProcessingException;
import com.taskmanager.application.respository.UserRepository;
import com.taskmanager.application.security.UserPrincipal;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleService roleService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        String provider = userRequest.getClientRegistration().getRegistrationId();
        logger.info("Loading OAuth2 user from provider: {}", provider);

        // 1. Cargar información del proveedor OAuth2
        OAuth2User oauth2User = super.loadUser(userRequest);
        logger.debug("Successfully loaded OAuth2 user information");

        try {
            // 2. Procesar y guardar/actualizar usuario en BD
            OAuth2User result = processOAuth2User(userRequest, oauth2User);
            logger.info("Successfully processed OAuth2 user for provider: {}", provider);
            return result;
        } catch (AuthenticationException ex) {
            logger.warn("Authentication exception for OAuth2 user: {}", ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            logger.error("Unexpected error processing OAuth2 user from provider: {}", provider, ex);
            // Wrapping internal exceptions as OAuth2AuthenticationException
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    /**
     * Procesa la información del usuario OAuth2 y lo guarda/actualiza en la BD
     */
    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        String provider = userRequest.getClientRegistration().getRegistrationId();
        logger.debug("Processing OAuth2 user for provider: {}", provider);

        AuthProvider authProvider = AuthProvider.fromString(provider);

        // Validar proveedor
        if (authProvider == null || !authProvider.isOAuth2Provider()) {
            logger.error("Unsupported OAuth2 provider: {}", provider);
            throw new OAuth2AuthenticationProcessingException("Proveedor OAuth2 no soportado: " + provider);
        }

        if (!authProvider.isProviderActive()) {
            logger.warn("Inactive OAuth2 provider attempted: {}", provider);
            throw new OAuth2AuthenticationProcessingException("Provider OAuth2 inactive: " + provider);
        }

        // Buscar o crear usuario
        User user = findOrCreateUser(oauth2User, authProvider, userRequest);
        logger.debug("User found/created for OAuth2 authentication");

        // Crear y retornar UserPrincipal con los datos del usuario
        return UserPrincipal.create(user, oauth2User.getAttributes());
    }

    /**
     * Busca o crea un usuario basado en la información de OAuth2
     */
    private User findOrCreateUser(OAuth2User oAuth2User, AuthProvider provider, OAuth2UserRequest userRequest) {
        String email = provider.extractEmail(oAuth2User, userRequest);
        logger.debug("Extracted email from OAuth2 user: {}", email != null ? email.replaceAll("(.{3})[^@]*(@.*)", "$1***$2") : "null");

        if (email == null || email.isEmpty()) {
            logger.error("Email not found in OAuth2 user for provider: {}", provider);
            throw new OAuth2AuthenticationProcessingException("Email no encontrado en el usuario OAuth2");
        }

        return userRepository.findByEmail(email)
                .map(existingUser -> {
                    logger.debug("Found existing user for email, updating...");
                    return updateExistingUser(existingUser, oAuth2User, provider);
                })
                .orElseGet(() -> {
                    logger.info("Creating new user for OAuth2 authentication");
                    return createNewUser(oAuth2User, provider, email);
                });
    }

    /**
     * Actualiza un usuario existente con información de OAuth2
     */
    private User updateExistingUser(User existingUser, OAuth2User oAuth2User, AuthProvider provider) {
        logger.debug("Updating existing user with OAuth2 information");

        // Agregar el nuevo proveedor si no lo tiene
        if (!existingUser.getAuthProviders().contains(provider)) {
            existingUser.addAuthProvider(provider);
            logger.debug("Added new auth provider: {} to existing user", provider);
        }

        // Actualizar información del usuario si es necesario
        FullName fullName = provider.extractFullName(oAuth2User);
        if (fullName != null && !fullName.getFullName().isEmpty() && existingUser.getName() == null) {
            existingUser.setName(fullName);
            logger.debug("Updated user name from OAuth2 information: {}", fullName.getFullName());
        }

        String username = provider.extractUsername(oAuth2User);
        if (existingUser.getUsername() == null || existingUser.getUsername().isEmpty()) {
            if (username == null || username.isEmpty()) {
                username = generateUniqueUsername(existingUser.getEmail());
            }
            existingUser.setUsername(username);
            logger.debug("Updated username for existing user: {}", username);
        }

        User savedUser = userRepository.save(existingUser);
        logger.info("Successfully updated existing user: {}", savedUser.getEmail());
        return savedUser;
    }

    /**
     * Crea un nuevo usuario basado en información de OAuth2
     */
    private User createNewUser(OAuth2User oAuth2User, AuthProvider provider, String email) {
        logger.info("Creating new user from OAuth2 authentication for provider: {}", provider);

        User newUser = new User();
        newUser.setEmail(email);
        newUser.addAuthProvider(provider);

        String username = provider.extractUsername(oAuth2User);
        if (username == null || username.isEmpty() || userRepository.existsByUsername(username)) {
            username = generateUniqueUsername(email);
            logger.debug("Generated unique username for new user");
        }
        newUser.setUsername(username);

        FullName fullName = provider.extractFullName(oAuth2User);
        if (fullName == null) {
            fullName = new FullName(username, "", "");
            logger.debug("Using username as display name for new user");
        }

        newUser.setName(fullName);

        // Establecer imagen de perfil
        // String picture = getProfilePicture(oAuth2User, provider);
        // if (picture != null && !picture.isEmpty()) {
        //     newUser.setProfilePicture(picture);
        // }
        // Asignar rol básico si existe
        if (roleService.existsBasicRole()) {
            newUser.addRole(roleService.getBasicRole());
            logger.debug("Assigned BASIC role to new user");
        } else {
            logger.warn("BASIC role not found when creating new OAuth2 user");
        }

        newUser.setAge(-1);

        // Establecer timestamps
        newUser.setCreationDate(new Date());

        User savedUser = userRepository.save(newUser);
        logger.info("Successfully created new user from OAuth2 authentication");
        return savedUser;
    }

    /**
     * Genera un username único basado en el email
     */
    private String generateUniqueUsername(String email) {
        logger.debug("Generating unique username from email");

        String baseUsername = email.substring(0, email.indexOf('@'));
        String username = baseUsername;
        int counter = 1;

        // Verificar si el username ya existe y generar uno único
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        logger.debug("Generated unique username: {}", username);
        return username;
    }

    /**
     * Obtiene la imagen de perfil según el proveedor OAuth2
     */
    // private String getProfilePicture(OAuth2User oAuth2User, String provider) {
    //     return switch (provider.toLowerCase()) {
    //         case "google" -> oAuth2User.getAttribute("picture");
    //         case "github" -> oAuth2User.getAttribute("avatar_url");
    //         case "facebook" -> {
    //             // Facebook estructura: picture.data.url
    //             Object picture = oAuth2User.getAttribute("picture");
    //             if (picture instanceof java.util.Map<?, ?> pictureMap) {
    //                 Object data = pictureMap.get("data");
    //                 if (data instanceof java.util.Map<?, ?> dataMap) {
    //                     yield (String) dataMap.get("url");
    //                 }
    //             }
    //             yield null;
    //         }
    //         default -> null;
    //     };
    // }
}

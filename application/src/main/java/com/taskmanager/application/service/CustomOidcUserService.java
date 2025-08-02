package com.taskmanager.application.service;

import java.util.Date;

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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleService roleService;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. Cargar información del proveedor OIDC
        OidcUser oidcUser = super.loadUser(userRequest);

        try {
            // 2. Procesar y guardar/actualizar usuario en BD
            return processOidcUser(userRequest, oidcUser);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            // Wrapping internal exceptions as OAuth2AuthenticationException
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    /**
     * Procesa la información del usuario OIDC y lo guarda/actualiza en la BD
     */
    private OidcUser processOidcUser(OidcUserRequest userRequest, OidcUser oidcUser) {
        String provider = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider authProvider = AuthProvider.fromString(provider);

        // Validar proveedor
        if (authProvider == null || !authProvider.isOAuth2Provider()) {
            throw new OAuth2AuthenticationProcessingException("Provider OIDC not supported: " + provider);
        }
        if (!authProvider.isProviderActive()) {
            throw new OAuth2AuthenticationProcessingException("Provider OIDC inactive: " + provider);
        }

        // Buscar o crear usuario
        User user = findOrCreateUser(oidcUser, authProvider, userRequest);

        // Crear y retornar UserPrincipal con los datos del usuario OIDC
        // Nota: Los atributos OIDC incluyen tanto claims estándar como atributos adicionales
        return UserPrincipal.createOidc(user, oidcUser.getAttributes(), oidcUser.getIdToken(), oidcUser.getUserInfo());
    }

    /**
     * Busca o crea un usuario basado en la información de OIDC
     */
    private User findOrCreateUser(OidcUser oidcUser, AuthProvider provider, OidcUserRequest userRequest) {
        String email = provider.extractEmail(oidcUser, userRequest);
        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationProcessingException("Email no encontrado en el usuario OIDC");
        }

        return userRepository.findByEmail(email)
            .map(existingUser -> updateExistingUser(existingUser, oidcUser, provider))
            .orElseGet(() -> createNewUser(oidcUser, provider, email));
    }

    /**
     * Actualiza un usuario existente con información de OIDC
     */
    private User updateExistingUser(User existingUser, OidcUser oidcUser, AuthProvider provider) {
        // Agregar el nuevo proveedor si no lo tiene
        if (!existingUser.getAuthProviders().contains(provider)) {
            existingUser.addAuthProvider(provider);
        }

        // Actualizar información del usuario si es necesario
        FullName fullName = provider.extractFullName(oidcUser);
        if (fullName != null && !fullName.getFullName().isEmpty() && existingUser.getName() == null) {
            existingUser.setName(fullName);
        }

        String username = provider.extractUsername(oidcUser);
        if (existingUser.getUsername() == null || existingUser.getUsername().isEmpty()) {
            if (username == null || username.isEmpty()) {
                username = generateUniqueUsername(existingUser.getEmail());
            }
            existingUser.setUsername(username);
        }

        // Actualizar timestamp de último login
        // existingUser.setLastLoginDate(new Date());

        return userRepository.save(existingUser);
    }

    /**
     * Crea un nuevo usuario basado en información de OIDC
     */
    private User createNewUser(OidcUser oidcUser, AuthProvider provider, String email) {
        User newUser = new User();
        newUser.setEmail(email);
        newUser.addAuthProvider(provider);

        String username = provider.extractUsername(oidcUser);
        if (username == null || username.isEmpty() || userRepository.existsByUsername(username)) {
            username = generateUniqueUsername(email);
        }
        newUser.setUsername(username);

        FullName fullName = provider.extractFullName(oidcUser);
        if (fullName == null) {
            fullName = new FullName(username, "", "");
        }
        newUser.setName(fullName);
        
        // Establecer imagen de perfil usando el método específico de OIDC
        // String picture = provider.extractProfilePicture(oidcUser);
        // if (picture != null && !picture.isEmpty()) {
        //     newUser.setProfilePicture(picture);
        // }
        
        // Asignar rol básico si existe
        if (roleService.existsBasicRole()) {
            newUser.addRole(roleService.getBasicRole());
        }

        newUser.setAge(-1);

        // Establecer timestamps
        newUser.setCreationDate(new Date());

        return userRepository.save(newUser);
    }

    /**
     * Genera un username único basado en el email
     */
    private String generateUniqueUsername(String email) {
        String baseUsername = email.substring(0, email.indexOf('@'));
        String username = baseUsername;
        int counter = 1;
        
        // Verificar si el username ya existe y generar uno único
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }
}
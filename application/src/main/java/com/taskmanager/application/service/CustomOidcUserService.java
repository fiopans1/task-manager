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
        String email = oidcUser.getEmail();

        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationProcessingException("Email no encontrado en el proveedor OIDC: " + provider);
        }

        // Buscar o crear usuario
        User user = findOrCreateUser(oidcUser, provider, email);

        // Crear y retornar UserPrincipal con los datos del usuario OIDC
        // Nota: Los atributos OIDC incluyen tanto claims estándar como atributos adicionales
        return UserPrincipal.createOidc(user, oidcUser.getAttributes(), oidcUser.getIdToken(), oidcUser.getUserInfo());
    }

    /**
     * Busca o crea un usuario basado en la información de OIDC
     */
    private User findOrCreateUser(OidcUser oidcUser, String provider, String email) {
        return userRepository.findByEmail(email)
            .map(existingUser -> updateExistingUser(existingUser, oidcUser, provider))
            .orElseGet(() -> createNewUser(oidcUser, provider, email));
    }

    /**
     * Actualiza un usuario existente con información de OIDC
     */
    private User updateExistingUser(User existingUser, OidcUser oidcUser, String provider) {
        // Agregar el nuevo proveedor si no lo tiene
        AuthProvider authProvider = AuthProvider.fromString(provider);
        if (!existingUser.getAuthProviders().contains(authProvider)) {
            existingUser.addAuthProvider(authProvider);
        }

        // Actualizar información del usuario si es necesario
        // Para Google/OIDC, usamos getFullName() y getGivenName(), getFamilyName()
        String fullName = oidcUser.getFullName();
        String givenName = oidcUser.getGivenName();
        String familyName = oidcUser.getFamilyName();
        
        if (existingUser.getName() == null) {
            if (fullName != null && !fullName.isEmpty()) {
                // Si tenemos nombre completo, lo parseamos
                String[] nameParts = parseFullName(fullName);
                existingUser.setName(new FullName(nameParts[0], nameParts[1], nameParts[2]));
            } else if (givenName != null || familyName != null) {
                // Si tenemos nombres por separado
                existingUser.setName(new FullName(
                    givenName != null ? givenName : "",
                    "",
                    familyName != null ? familyName : ""
                ));
            }
        }

        // Actualizar imagen de perfil si viene del proveedor OIDC
        // String picture = oidcUser.getPicture();
        // if (picture != null && !picture.isEmpty()) {
        //     // existingUser.setProfilePicture(picture);
        // }

        // Actualizar timestamp de último login
        // existingUser.setLastLoginDate(new Date());

        return userRepository.save(existingUser);
    }

    /**
     * Crea un nuevo usuario basado en información de OIDC
     */
    private User createNewUser(OidcUser oidcUser, String provider, String email) {
        User newUser = new User();
        newUser.setEmail(email);
        newUser.addAuthProvider(AuthProvider.fromString(provider));
        
        // Establecer nombre usando métodos específicos de OIDC
        String fullName = oidcUser.getFullName();
        String givenName = oidcUser.getGivenName();
        String familyName = oidcUser.getFamilyName();
        
        if (fullName != null && !fullName.isEmpty()) {
            // Si tenemos nombre completo, lo parseamos
            String[] nameParts = parseFullName(fullName);
            newUser.setName(new FullName(nameParts[0], nameParts[1], nameParts[2]));
        } else if (givenName != null || familyName != null) {
            // Si tenemos nombres por separado
            newUser.setName(new FullName(
                givenName != null ? givenName : "",
                "",
                familyName != null ? familyName : ""
            ));
        }

        // TO-DO: Find if in the provider we can get the username
        // Para Google, podemos usar el 'preferred_username' claim si está disponible
        String preferredUsername = oidcUser.getPreferredUsername();
        if (preferredUsername != null && !preferredUsername.isEmpty()) {
            newUser.setUsername(generateUniqueUsername(preferredUsername));
        } else {
            // Generar username único basado en email
            newUser.setUsername(generateUniqueUsername(email));
        }
        
        // Establecer imagen de perfil usando el método específico de OIDC
        String picture = oidcUser.getPicture();
        if (picture != null && !picture.isEmpty()) {
            // newUser.setProfilePicture(picture);
        }
        
        // Asignar rol básico si existe
        if (roleService.existsBasicRole()) {
            newUser.addRole(roleService.getBasicRole());
        }

        // Establecer timestamps
        newUser.setCreationDate(new Date());

        return userRepository.save(newUser);
    }

    /**
     * Genera un username único basado en el email o preferred_username
     */
    private String generateUniqueUsername(String baseInput) {
        String baseUsername;
        
        // Si el input contiene @, es un email
        if (baseInput.contains("@")) {
            baseUsername = baseInput.substring(0, baseInput.indexOf('@'));
        } else {
            baseUsername = baseInput;
        }
        
        String username = baseUsername;
        int counter = 1;
        
        // Verificar si el username ya existe y generar uno único
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }

    /**
     * Parsea un nombre completo en partes (nombre, segundo nombre, apellido)
     */
    private String[] parseFullName(String fullName) {
        String[] parts = fullName.trim().split("\\s+");
        String firstName = parts.length > 0 ? parts[0] : "";
        String middleName = parts.length > 2 ? parts[1] : "";
        String lastName = parts.length > 1 ? parts[parts.length - 1] : "";
        
        return new String[]{firstName, middleName, lastName};
    }
}
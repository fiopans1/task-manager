package com.taskmanager.application.service;

import java.util.Date;

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
import com.taskmanager.application.service.RoleService;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleService roleService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. Cargar información del proveedor OAuth2
        OAuth2User oauth2User = super.loadUser(userRequest);

        try {
            // 2. Procesar y guardar/actualizar usuario en BD
            return processOAuth2User(userRequest, oauth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            // Wrapping internal exceptions as OAuth2AuthenticationException
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    /**
     * Procesa la información del usuario OAuth2 y lo guarda/actualiza en la BD
     */
    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        String provider = userRequest.getClientRegistration().getRegistrationId();
        String email = oauth2User.getAttribute("email");

        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationProcessingException("Email no encontrado en el proveedor OAuth2: " + provider);
        }

        // Buscar o crear usuario
        User user = findOrCreateUser(oauth2User, provider, email);

        // Crear y retornar UserPrincipal con los datos del usuario
        return UserPrincipal.create(user, oauth2User.getAttributes());
    }

    /**
     * Busca o crea un usuario basado en la información de OAuth2
     */
    private User findOrCreateUser(OAuth2User oAuth2User, String provider, String email) {
        return userRepository.findByEmail(email)
            .map(existingUser -> updateExistingUser(existingUser, oAuth2User, provider))
            .orElseGet(() -> createNewUser(oAuth2User, provider, email));
    }

    /**
     * Actualiza un usuario existente con información de OAuth2
     */
    private User updateExistingUser(User existingUser, OAuth2User oAuth2User, String provider) {
        // Agregar el nuevo proveedor si no lo tiene
        AuthProvider authProvider = AuthProvider.fromString(provider);
        if (!existingUser.getAuthProviders().contains(authProvider)) {
            existingUser.addAuthProvider(authProvider);
        }

        // Actualizar información del usuario si es necesario
        String name = oAuth2User.getAttribute("name");
        if (name != null && !name.isEmpty() && existingUser.getName() == null) {
            existingUser.setName(new FullName(name, "", ""));
        }

        // Actualizar imagen de perfil si viene del proveedor
        // String picture = getProfilePicture(oAuth2User, provider);
        // if (picture != null && !picture.isEmpty()) {
        //     existingUser.setProfilePicture(picture);
        // }

        // Actualizar timestamp de último login

        return userRepository.save(existingUser);
    }

    /**
     * Crea un nuevo usuario basado en información de OAuth2
     */
    private User createNewUser(OAuth2User oAuth2User, String provider, String email) {
        User newUser = new User();
        newUser.setEmail(email);
        newUser.addAuthProvider(AuthProvider.fromString(provider));
        
        // Establecer nombre si está disponible
        String name = oAuth2User.getAttribute("name");
        if (name != null && !name.isEmpty()) {
            newUser.setName(new FullName(name, "", ""));
        }
        //TO-DO: Find if in the provider we can get the username
        // Generar username único basado en email
        newUser.setUsername(generateUniqueUsername(email));
        
        // Establecer imagen de perfil
        // String picture = getProfilePicture(oAuth2User, provider);
        // if (picture != null && !picture.isEmpty()) {
        //     newUser.setProfilePicture(picture);
        // }
        
        // Asignar rol básico si existe
        if (roleService.existsBasicRole()) {
            newUser.addRole(roleService.getBasicRole());
        }

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
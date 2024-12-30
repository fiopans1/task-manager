package com.taskmanager.application.service;

import com.taskmanager.application.model.dto.LoginDTO;
import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.validations.UserValidation;
import com.taskmanager.application.respository.UserRepository;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    @Autowired
    private JWTUtilityService jwtUtilityService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserValidation userValidation;


    public HashMap<String,String> login(LoginDTO login) throws Exception {

        try{
            HashMap<String,String> response = new HashMap<>();
            Optional<User> user = userRepository.findByUsername(login.getUsername());
            if(user.isEmpty()){
                response.put("error", "User not registered!");
                return response;
            }

            if(verifyPassword(login.getPassword(), user.get().getPassword())){
                String token = jwtUtilityService.generateJWT(user.get());
                response.put("token", token);
                return response;
            }else{
                response.put("error", "Authentication failed!");
                return response;
            }
        }catch(Exception e){
            throw new Exception(e.toString());
        }
    }

    private boolean verifyPassword(String enteredPassword, String storedPassword){
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.matches(enteredPassword, storedPassword);
    }

    public ResponseDTO register(User user) throws Exception{

        try{
            ResponseDTO response = userValidation.validateUser(user);
            if(response.getErrorCount() > 0){
                return response;
            }
            Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
            if(existingUser.isPresent()){
                response.addErrorMessage("User already registered!");
                return response;
            }

            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
            user.setPassword(encoder.encode(user.getPassword()));
            userRepository.save(user);
            response.addErrorMessage("User registered successfully!");
            return response;
            
        }catch(Exception e){
            throw new Exception(e.toString());
        }
        
    }

    // public Optional<User> getAuthenticatedUser() {
    //     Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    //     if (authentication != null && authentication.isAuthenticated()) {
    //         Object principal = authentication.getPrincipal();
    //         if (principal instanceof UserDetails) {
    //             String username = ((UserDetails) principal).getUsername();
    //             return userRepository.findByUsername(username);
    //         }
    //     }
    //     return null;
    // }
    // Obtener el usuario autenticado
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null; // No hay usuario autenticado
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString(); // Esto ocurre si no estás usando UserDetails
        }
    }

    // Obtener los roles del usuario autenticado
    public static Collection<? extends GrantedAuthority> getCurrentUserRoles() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Collections.emptyList(); // No hay roles disponibles
        }

        return authentication.getAuthorities();
    }
}

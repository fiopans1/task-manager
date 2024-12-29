package com.taskmanager.application.service;

import com.taskmanager.application.model.dto.LoginDTO;
import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.validations.UserValidation;
import com.taskmanager.application.respository.UserRepository;
import java.util.HashMap;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
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
            Optional<User> user = userRepository.findByEmail(login.getEmail());
            if(user.isEmpty()){
                response.put("error", "User not registered!");
                return response;
            }

            if(verifyPassword(login.getPassword(), user.get().getPassword())){
                String token = jwtUtilityService.generateJWT(user.get().getId());
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
            Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
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

}

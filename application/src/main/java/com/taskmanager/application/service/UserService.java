package com.taskmanager.application.service;

import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.respository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    public User newUser(User user){ /*Esto solo un administrador */
        return userRepository.save(user);  
    }

    public void deleteUser(User user){ /*Esto solo un administrador */
        userRepository.delete(user);
    }

    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }

    public User findByUserId(Long id){

        Optional<User> user = userRepository.findById(id);
        if(user.isPresent()){
            return user.get();
        }else{
            throw new ResourceNotFoundException("User not found with id: "+id);
        }
    }

    public List<User> getAllUser(){
        return userRepository.findAll();
    }

    public User findUsersByUserName(String name) {
        Optional<User> user = userRepository.findByUsername(name);
        if(user.isPresent()){
            return user.get();
        }else{
            throw new ResourceNotFoundException("User not found with name: "+name);
        }
    }

    public User findByEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if(user.isPresent()){
            return user.get();
        }else{
            throw new ResourceNotFoundException("User not found with email: "+email);
        }
    }

    
}

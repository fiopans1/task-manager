package com.taskmanager.application.model.validations;

import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.entities.User;

public class UserValidation {
    public ResponseDTO validateUser(User user) {

        ResponseDTO response = new ResponseDTO();

        if(user == null){
            response.addErrorMessage("User object is null");
            return response;
        }
        if(user.getUsername() == null || user.getUsername().trim().isEmpty()){
            response.addErrorMessage("Username is required");
        }
        if(user.getEmail() == null || !user.getEmail().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")){
           response.addErrorMessage("Email is required and must be a valid email");
        }
        if(user.getPassword() == null || !(user.getPassword().length() >= 8 && user.getPassword().matches(".*[A-Z].*") && user.getPassword().matches(".*[a-z].*") && user.getPassword().matches(".*\\d.*") && user.getPassword().matches(".*[!@#$%^&*()].*"))){
            response.addErrorMessage("Password is required and must have at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character");
        }
        if(user.getAge() > 120 || user.getAge() < 13){
            response.addErrorMessage("Age is required and must be between 13 and 120");
        }

        return response;
    }
}

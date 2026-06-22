package com.taskmanager.application.model.validations;

import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.entities.User;

public class UserValidation {
    public ResponseDTO validateUser(User user) {

        ResponseDTO response = new ResponseDTO();

        if(user.getUsername() == null || user.getUsername().trim().isEmpty()){
            response.addErrorMessage("Username is required");
        }
        if(user.getEmail() == null || !user.getEmail().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")){
           response.addErrorMessage("Email is required and must be a valid email");
        }
        if(user.getPassword() == null || !(user.getPassword().length() >= 8 && containsUppercase(user.getPassword()) && containsLowercase(user.getPassword()) && containsDigit(user.getPassword()) && containsSpecialChar(user.getPassword()))){
            response.addErrorMessage("Password is required and must have at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character");
        }

        return response;
    }

    private boolean containsUppercase(String str) {
        for (char c : str.toCharArray()) {
            if (Character.isUpperCase(c)) return true;
        }
        return false;
    }

    private boolean containsLowercase(String str) {
        for (char c : str.toCharArray()) {
            if (Character.isLowerCase(c)) return true;
        }
        return false;
    }

    private boolean containsDigit(String str) {
        for (char c : str.toCharArray()) {
            if (Character.isDigit(c)) return true;
        }
        return false;
    }

    private boolean containsSpecialChar(String str) {
        String specialChars = "!@#$%^&*()";
        for (char c : str.toCharArray()) {
            if (specialChars.indexOf(c) >= 0) return true;
        }
        return false;
    }
}

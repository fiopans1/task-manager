package com.taskmanager.application.model.validations;

import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.entities.User;

public class UserValidation {

    private static final String EMAIL_PATTERN = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
    private static final String PASSWORD_ERROR_MESSAGE =
            "Password is required and must have at least 8 characters, one uppercase letter, "
            + "one lowercase letter, one number and one special character";

    public ResponseDTO validateUser(User user) {

        ResponseDTO response = new ResponseDTO();

        String usernameError = validateUsername(user.getUsername());
        if (usernameError != null) {
            response.addErrorMessage(usernameError);
        }

        String emailError = validateEmail(user.getEmail());
        if (emailError != null) {
            response.addErrorMessage(emailError);
        }

        String passwordError = validatePassword(user.getPassword());
        if (passwordError != null) {
            response.addErrorMessage(passwordError);
        }

        return response;
    }

    public String validateUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return "Username is required";
        }
        return null;
    }

    public String validateEmail(String email) {
        if (email == null || !email.matches(EMAIL_PATTERN)) {
            return "Email is required and must be a valid email";
        }
        return null;
    }

    public String validatePassword(String password) {
        if (password == null || !(password.length() >= 8
                && password.matches(".*[A-Z].*")
                && password.matches(".*[a-z].*")
                && password.matches(".*\\d.*")
                && password.matches(".*[!@#$%^&*()].*"))) {
            return PASSWORD_ERROR_MESSAGE;
        }
        return null;
    }
}

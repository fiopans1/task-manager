package com.taskmanager.application.model.entities;

public enum AuthProvider {
    LOCAL,
    GOOGLE,
    GITHUB;


    public static AuthProvider fromString(String provider) {
        switch (provider.toUpperCase()) {
            case "GOOGLE":
                return GOOGLE;
            case "GITHUB":
                return GITHUB;
            default:
                return LOCAL; // Default to LOCAL if no match found
        }
    }
}

package com.taskmanager.application.model.dto;

import java.util.List;

public class SessionInfoDTO {

    private String username;
    private String email;
    private List<String> roles;
    private long expiresAt;

    public SessionInfoDTO() {
    }

    public SessionInfoDTO(String username, String email, List<String> roles, long expiresAt) {
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.expiresAt = expiresAt;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public long getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(long expiresAt) {
        this.expiresAt = expiresAt;
    }
}

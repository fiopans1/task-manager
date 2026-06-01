package com.taskmanager.application.model.dto;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class SessionDTO {

    private boolean authenticated;

    private String sessionId;

    private Date accessExpiresAt;

    private UserDTO user;

    private List<String> roles = new ArrayList<>();

    public boolean isAuthenticated() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Date getAccessExpiresAt() {
        return accessExpiresAt;
    }

    public void setAccessExpiresAt(Date accessExpiresAt) {
        this.accessExpiresAt = accessExpiresAt;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}

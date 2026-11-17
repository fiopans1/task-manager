package com.taskmanager.application.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.taskmanager.application.model.entities.FullName;

/**
 * Narrow request contract for local registration. Keeping this separate from
 * the JPA {@code User} entity prevents clients from assigning ids, roles,
 * block state, auth providers or persisted relationships.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class RegisterDTO {

    private String username;

    private String email;

    private String password;

    private FullName name;

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public FullName getName() {
        return name;
    }

    public void setName(FullName name) {
        this.name = name;
    }
}

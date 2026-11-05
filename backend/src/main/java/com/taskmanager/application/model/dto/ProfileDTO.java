package com.taskmanager.application.model.dto;

import com.taskmanager.application.model.entities.AuthProvider;
import com.taskmanager.application.model.entities.FullName;
import com.taskmanager.application.model.entities.User;

import java.util.List;

public class ProfileDTO {

    private String username;

    private String email;

    private String name;

    private String surname1;

    private String surname2;

    private String displayName;

    private List<String> authProviders;

    private boolean canChangeEmail;

    private boolean canChangePassword;

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname1() {
        return surname1;
    }

    public void setSurname1(String surname1) {
        this.surname1 = surname1;
    }

    public String getSurname2() {
        return surname2;
    }

    public void setSurname2(String surname2) {
        this.surname2 = surname2;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public List<String> getAuthProviders() {
        return authProviders;
    }

    public void setAuthProviders(List<String> authProviders) {
        this.authProviders = authProviders;
    }

    public boolean isCanChangeEmail() {
        return canChangeEmail;
    }

    public void setCanChangeEmail(boolean canChangeEmail) {
        this.canChangeEmail = canChangeEmail;
    }

    public boolean isCanChangePassword() {
        return canChangePassword;
    }

    public void setCanChangePassword(boolean canChangePassword) {
        this.canChangePassword = canChangePassword;
    }

    public static ProfileDTO fromUser(User user) {
        ProfileDTO dto = new ProfileDTO();
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());

        FullName fullName = user.getName();
        dto.setName(fullName != null ? fullName.getName() : "");
        dto.setSurname1(fullName != null ? fullName.getSurname1() : "");
        dto.setSurname2(fullName != null ? fullName.getSurname2() : "");

        String displayName = fullName != null ? fullName.getFullName() : "";
        dto.setDisplayName(displayName == null || displayName.isBlank() ? user.getUsername() : displayName);

        boolean hasOAuthProvider = user.getAuthProviders().stream()
                .anyMatch(AuthProvider::isOAuth2Provider);
        boolean hasLocalPassword = user.getAuthProviders().contains(AuthProvider.LOCAL)
                && user.getPassword() != null
                && !user.getPassword().isBlank();

        dto.setAuthProviders(user.getAuthProviders().stream()
                .map(Enum::name)
                .sorted()
                .toList());
        dto.setCanChangeEmail(!hasOAuthProvider);
        dto.setCanChangePassword(hasLocalPassword);
        return dto;
    }
}

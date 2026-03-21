package com.taskmanager.application.security;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.taskmanager.application.model.entities.FullName;
import com.taskmanager.application.model.entities.RoleOfUser;
import com.taskmanager.application.model.entities.User;

public class UserPrincipal implements OAuth2User, OidcUser, UserDetails {

    private static final Logger logger = LoggerFactory.getLogger(UserPrincipal.class);

    private Long id;
    private String email;
    private String username;
    private FullName name;
    private Set<RoleOfUser> roles;
    private Map<String, Object> attributes;
    private OidcIdToken idToken;
    private OidcUserInfo userInfo;

    public UserPrincipal(Long id, String email, String username, FullName name, Set<RoleOfUser> roles) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.name = name;
        this.roles = roles;
    }

    public static UserPrincipal create(User user) {
        logger.debug("Creating UserPrincipal for user: {}", user.getUsername());
        Set<GrantedAuthority> authorities = (Set<GrantedAuthority>) user.getAuthorities();

        UserPrincipal userPrincipal = new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getName(),
                user.getRoles() != null ? user.getRoles() : Collections.emptySet()
        );
        logger.debug("UserPrincipal created successfully for user: {}", user.getUsername());
        return userPrincipal;
    }

    public static UserPrincipal create(User user, Map<String, Object> attributes) {
        logger.debug("Creating UserPrincipal with OAuth2 attributes for user: {}", user.getUsername());
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        userPrincipal.setAttributes(attributes);
        logger.debug("UserPrincipal with OAuth2 attributes created for user: {}", user.getUsername());
        return userPrincipal;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    // UserDetails implementation
    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = roles.stream()
                .flatMap(role -> {
                    Set<GrantedAuthority> roleAuthorities = role.getAuthorities().stream()
                            .map(authority -> new SimpleGrantedAuthority(authority.getName()))
                            .collect(Collectors.toSet());
                    roleAuthorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
                    return roleAuthorities.stream();
                })
                .collect(Collectors.toSet());
        return authorities;
    }

    // OAuth2User implementation
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    public void setAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getName() {
        return name.getFullName();
    }

    public static UserPrincipal createOidc(User user, Map<String, Object> attributes,
            OidcIdToken idToken, OidcUserInfo userInfo) {
        UserPrincipal userPrincipal = UserPrincipal.create(user, attributes);
        userPrincipal.idToken = idToken;
        userPrincipal.userInfo = userInfo;
        return userPrincipal;
    }

// Con sus getters correspondientes
    public OidcIdToken getIdToken() {
        return idToken;
    }

    public OidcUserInfo getUserInfo() {
        return userInfo;
    }

    @Override
    public Map<String, Object> getClaims() {
        return attributes;
    }

}
